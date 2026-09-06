import express, { NextFunction, Request, Response, Router } from 'express';
import * as repo from './repositories/index.js';
import { processAiMessage } from './ai.js';
import { verifyAdminToken } from './authToken.js';

export const app = express();

// Global Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// CORS helper headers for serverless
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const api = Router();
const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Administrator authentication required.'
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({
      error: 'Invalid or expired administrator session.'
    });
  }

  res.locals.admin = payload;
  next();
};

// ================= HEALTH CHECK =================
api.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    platform: 'Selling Ajah Production API'
  });
});

// ================= PROPERTIES =================
api.get('/properties', async (req: Request, res: Response) => {
  try {
    const { listingType, area, status, minPrice, maxPrice, bedrooms, featured } = req.query;
    const properties = await repo.getProperties({
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
    console.error('Error in GET /api/properties:', err);
    res.status(500).json({ error: err.message });
  }
});

api.get('/properties/:slug', async (req: Request, res: Response) => {
  try {
    const prop = await repo.getPropertyBySlug(req.params.slug);
    if (!prop) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(prop);
  } catch (err: any) {
    console.error('Error in GET /api/properties/:slug:', err);
    res.status(500).json({ error: err.message });
  }
});

api.post('/properties', requireAdmin, async (req, res) => {
  try {
    const created = await repo.createProperty(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error in POST /api/properties:', err);
    res.status(400).json({ error: err.message });
  }
});

api.put('/properties/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateProperty(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Property not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Error in PUT /api/properties/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

api.delete('/properties/:id', requireAdmin, async (req, res) => {
  try {
    const ok = await repo.deleteProperty(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Property not found' });
    res.json({ success: true, message: 'Property deleted' });
  } catch (err: any) {
    console.error('Error in DELETE /api/properties/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

api.post('/properties/:id/duplicate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const dup = await repo.duplicateProperty(req.params.id);
    if (!dup) return res.status(404).json({ error: 'Property not found' });
    res.json(dup);
  } catch (err: any) {
    console.error('Error in duplicate property:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= APARTMENTS =================
api.get('/apartments', async (req: Request, res: Response) => {
  try {
    const { area, maxGuests, featured, status } = req.query;
    const apartments = await repo.getApartments({
      area: area as string,
      maxGuests: maxGuests ? Number(maxGuests) : undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      status: status as string
    });
    res.json(apartments);
  } catch (err: any) {
    console.error('Error in GET /api/apartments:', err);
    res.status(500).json({ error: err.message });
  }
});

api.get('/apartments/:slug', async (req: Request, res: Response) => {
  try {
    const apt = await repo.getApartmentBySlug(req.params.slug);
    if (!apt) return res.status(404).json({ error: 'Apartment not found' });
    res.json(apt);
  } catch (err: any) {
    console.error('Error in GET /api/apartments/:slug:', err);
    res.status(500).json({ error: err.message });
  }
});

api.post('/apartments', requireAdmin, async (req, res) => {
  try {
    const created = await repo.createApartment(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error in POST /api/apartments:', err);
    res.status(400).json({ error: err.message });
  }
});

api.put('/apartments/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateApartment(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Apartment not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Error in PUT /api/apartments/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

api.delete('/apartments/:id', requireAdmin, async (req, res) => {
  try {
    const ok = await repo.deleteApartment(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Apartment not found' });
    res.json({ success: true, message: 'Apartment deleted' });
  } catch (err: any) {
    console.error('Error in DELETE /api/apartments/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= VEHICLES =================
api.get('/vehicles', async (req: Request, res: Response) => {
  try {
    const { category, brand, featured, status } = req.query;
    const vehicles = await repo.getVehicles({
      category: category as string,
      brand: brand as string,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      status: status as string
    });
    res.json(vehicles);
  } catch (err: any) {
    console.error('Error in GET /api/vehicles:', err);
    res.status(500).json({ error: err.message });
  }
});

api.get('/vehicles/:slug', async (req: Request, res: Response) => {
  try {
    const veh = await repo.getVehicleBySlug(req.params.slug);
    if (!veh) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(veh);
  } catch (err: any) {
    console.error('Error in GET /api/vehicles/:slug:', err);
    res.status(500).json({ error: err.message });
  }
});

api.post('/vehicles', requireAdmin, async (req, res) => {
  try {
    const created = await repo.createVehicle(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error in POST /api/vehicles:', err);
    res.status(400).json({ error: err.message });
  }
});

api.put('/vehicles/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateVehicle(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Error in PUT /api/vehicles/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

api.delete('/vehicles/:id', requireAdmin, async (req, res) => {
  try {
    const ok = await repo.deleteVehicle(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err: any) {
    console.error('Error in DELETE /api/vehicles/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ENQUIRIES =================
api.get('/enquiries', requireAdmin, async (_req, res) => {
  try {
    const list = await repo.getEnquiries();
    res.json(list);
  } catch (err: any) {
    console.error('Error in GET /api/enquiries:', err);
    res.status(500).json({ error: err.message });
  }
});

api.post('/enquiries', async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || (!phone && !email)) {
      return res.status(400).json({ error: 'Name and at least phone or email are required.' });
    }
    const created = await repo.createEnquiry(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error in POST /api/enquiries:', err);
    res.status(400).json({ error: err.message });
  }
});

api.put('/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateEnquiry(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Error in PUT /api/enquiries/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

api.patch('/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateEnquiry(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Error in PATCH /api/enquiries/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

api.delete('/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const ok = await repo.deleteEnquiry(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error in DELETE /api/enquiries/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= TESTIMONIALS & FAQS =================
api.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const list = await repo.getTestimonials();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post('/testimonials', requireAdmin, async (req, res) => {
  try {
    const created = await repo.createTestimonial(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

api.delete('/testimonials/:id', requireAdmin, async (req, res) => {
  try {
    const ok = await repo.deleteTestimonial(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.get('/faqs', async (req: Request, res: Response) => {
  try {
    const list = await repo.getFaqs();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SETTINGS =================
api.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await repo.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.put('/settings', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

api.post('/settings', requireAdmin, async (req, res) => {
  try {
    const updated = await repo.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= STATS & SEARCH =================
api.get('/stats', requireAdmin, async (_req, res) => {
  try {
    const [properties, apartments, vehicles, enquiries] = await Promise.all([
      repo.getProperties(),
      repo.getApartments(),
      repo.getVehicles(),
      repo.getEnquiries()
    ]);

    res.json({
      totalProperties: properties.length,
      propertiesForSale: properties.filter(p => p.listingType === 'sale' && p.status === 'available').length,
      propertiesForRent: properties.filter(p => p.listingType === 'rent' && p.status === 'available').length,
      availableShortlets: apartments.filter(a => a.isAvailable).length,
      availableVehicles: vehicles.filter(v => v.isAvailable).length,
      totalEnquiries: enquiries.length,
      newEnquiries: enquiries.filter(e => e.status === 'new').length,
      featuredListings: properties.filter(p => p.isFeatured).length,
      recentProperties: properties.slice(0, 5),
      recentEnquiries: enquiries.slice(0, 5)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.get('/search', async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json({ properties: [], apartments: [], vehicles: [], totalCount: 0 });
    }

    const [properties, apartments, vehicles] = await Promise.all([
      repo.getProperties(),
      repo.getApartments(),
      repo.getVehicles()
    ]);

    const matchedProps = properties.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) ||
      p.listingType.toLowerCase().includes(q) ||
      p.amenities.some(a => a.toLowerCase().includes(q))
    );

    const matchedApts = apartments.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q) ||
      a.amenities.some(am => am.toLowerCase().includes(q))
    );

    const matchedVehs = vehicles.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.features.some(f => f.toLowerCase().includes(q))
    );

    res.json({
      properties: matchedProps,
      apartments: matchedApts,
      vehicles: matchedVehs,
      totalCount: matchedProps.length + matchedApts.length + matchedVehs.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= AUTHENTICATION =================
api.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await repo.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your administrator password.' });
    }
    res.json({ user, token: user.token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.get('/auth/users', requireAdmin, async (_req, res) => {
  try {
    const users = await repo.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

api.post('/auth/users', requireAdmin, async (req, res) => {
  try {
    const newUser = await repo.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

api.delete('/auth/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const ok = await repo.deleteUser(req.params.id);
    if (!ok) return res.status(400).json({ error: 'Cannot delete user.' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================= AI CHATBOT =================
api.post('/chat', async (req: Request, res: Response) => {
  try {
    const result = await processAiMessage(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      reply: "I am ready to assist you with properties, shortlets, and car rentals in Ajah and Lekki. What are you looking for today?",
      actionButtons: [
        { label: 'Chat on WhatsApp', action: 'whatsapp', value: '+2348109012192'}
      ]
    });
  }
});

// Mount router under both /api and root / so serverless and local dev both work flawlessly
app.use('/api', api);
app.use('/', api);
