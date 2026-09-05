import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { processAiMessage } from './server/ai.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Basic API Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'Selling Ajah' });
  });

  // ================= PROPERTIES =================
  app.get('/api/properties', (req: Request, res: Response) => {
    try {
      const { listingType, area, status, minPrice, maxPrice, bedrooms, featured } = req.query;
      const properties = db.getProperties({
        listingType: listingType as string,
        area: area as string,
        status: status as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined
      });
      res.json(properties);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/properties/:slug', (req: Request, res: Response) => {
    try {
      const prop = db.getPropertyBySlug(req.params.slug);
      if (!prop) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.json(prop);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/properties', (req: Request, res: Response) => {
    try {
      const created = db.createProperty(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/properties/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateProperty(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Property not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/properties/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteProperty(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Property not found' });
      res.json({ success: true, message: 'Property deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/properties/:id/duplicate', (req: Request, res: Response) => {
    try {
      const dup = db.duplicateProperty(req.params.id);
      if (!dup) return res.status(404).json({ error: 'Property not found' });
      res.json(dup);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ================= APARTMENTS =================
  app.get('/api/apartments', (req: Request, res: Response) => {
    try {
      const { area, maxGuests, featured, status } = req.query;
      const apartments = db.getApartments({
        area: area as string,
        maxGuests: maxGuests ? Number(maxGuests) : undefined,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        status: status as string
      });
      res.json(apartments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/apartments/:slug', (req: Request, res: Response) => {
    try {
      const apt = db.getApartmentBySlug(req.params.slug);
      if (!apt) return res.status(404).json({ error: 'Apartment not found' });
      res.json(apt);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/apartments', (req: Request, res: Response) => {
    try {
      const created = db.createApartment(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/apartments/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateApartment(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Apartment not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/apartments/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteApartment(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Apartment not found' });
      res.json({ success: true, message: 'Apartment deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ================= VEHICLES =================
  app.get('/api/vehicles', (req: Request, res: Response) => {
    try {
      const { category, brand, featured, status } = req.query;
      const vehicles = db.getVehicles({
        category: category as string,
        brand: brand as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        status: status as string
      });
      res.json(vehicles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/vehicles/:slug', (req: Request, res: Response) => {
    try {
      const veh = db.getVehicleBySlug(req.params.slug);
      if (!veh) return res.status(404).json({ error: 'Vehicle not found' });
      res.json(veh);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/vehicles', (req: Request, res: Response) => {
    try {
      const created = db.createVehicle(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/vehicles/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateVehicle(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/vehicles/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteVehicle(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true, message: 'Vehicle deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ================= ENQUIRIES =================
  app.get('/api/enquiries', (req: Request, res: Response) => {
    try {
      res.json(db.getEnquiries());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/enquiries', (req: Request, res: Response) => {
    try {
      const { name, phone, email, message } = req.body;
      if (!name || (!phone && !email)) {
        return res.status(400).json({ error: 'Name and at least phone or email are required.' });
      }
      const created = db.createEnquiry(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/enquiries/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateEnquiry(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/enquiries/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteEnquiry(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Enquiry not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ================= TESTIMONIALS & FAQS & SETTINGS =================
  app.get('/api/testimonials', (req: Request, res: Response) => {
    res.json(db.getTestimonials());
  });

  app.post('/api/testimonials', (req: Request, res: Response) => {
    try {
      const created = db.createTestimonial(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/testimonials/:id', (req: Request, res: Response) => {
    try {
      const ok = db.deleteTestimonial(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/faqs', (req: Request, res: Response) => {
    res.json(db.getFaqs());
  });

  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/stats', (req: Request, res: Response) => {
    res.json(db.getStats());
  });

  // Global search
  app.get('/api/search', (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    res.json(db.search(q));
  });

  // ================= AUTHENTICATION =================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = db.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Use username "admin" and password "admin".' });
    }
    res.json({ user, token: user.token });
  });

  app.get('/api/auth/users', (req: Request, res: Response) => {
    res.json(db.getUsers());
  });

  app.post('/api/auth/users', (req: Request, res: Response) => {
    try {
      const newUser = db.createUser(req.body);
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/auth/users/:id', (req: Request, res: Response) => {
    const ok = db.deleteUser(req.params.id);
    if (!ok) return res.status(400).json({ error: 'Cannot delete the only remaining administrator.' });
    res.json({ success: true });
  });

  // ================= AI CHATBOT =================
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const result = await processAiMessage(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({
        reply: "I am ready to assist you with properties, shortlets, and car rentals in Ajah and Lekki. What are you looking for today?",
        actionButtons: [
          { label: 'Chat on WhatsApp', action: 'whatsapp', value: '+2348123456789' }
        ]
      });
    }
  });

  // ================= VITE / FRONTEND SERVING =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Selling Ajah server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
