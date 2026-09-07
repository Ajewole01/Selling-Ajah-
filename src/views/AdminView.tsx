import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property, ServicedApartment, LuxuryVehicle, Enquiry } from '../types';
import { formatNaira, formatWhatsAppUrl } from '../utils/formatters';
import {
  Lock,
  Unlock,
  Building2,
  Key,
  Car,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Search,
  Loader2,
  Eye,
  ShieldCheck
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    addToast,
    settings,
    updateSettings,
    currentUser,
    setCurrentUser,
    logout
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const authenticated = Boolean(currentUser?.token);

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'properties' | 'apartments' | 'vehicles' | 'settings'>('overview');

  // Data
  const [properties, setProperties] = useState<Property[]>([]);
  const [apartments, setApartments] = useState<ServicedApartment[]>([]);
  const [vehicles, setVehicles] = useState<LuxuryVehicle[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Property Modal / Form State
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(150000000);
  const [newListingType, setNewListingType] = useState<'sale' | 'rent'>('sale');
  const [newArea, setNewArea] = useState('Ajah');
  const [newLocation, setNewLocation] = useState('Abraham Adesanya Estate, Ajah, Lagos');
  const [newType, setNewType] = useState('Detached Duplex');
  const [newBeds, setNewBeds] = useState(4);
  const [newBaths, setNewBaths] = useState(5);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
  const [newDesc, setNewDesc] = useState('Luxury modern detached duplex in a secure gated estate with fitted kitchen and ensuite bedrooms.');

  // Settings edit state
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);

  const getAdminHeaders = (token?: string, includeJson = false): HeadersInit => {
    const headers: Record<string, string> = {};
    const activeToken = token || currentUser?.token;

    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    if (activeToken) {
      headers.Authorization = `Bearer ${activeToken}`;
    }

    return headers;
  };

  const handleUnauthorized = () => {
    setCurrentUser(null);
    setAuthError('Your administrator session has expired. Please sign in again.');
    addToast('Admin session expired. Please sign in again.', 'error');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier.trim(),
          password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.user || !data?.token) {
        throw new Error(data?.error || 'Invalid administrator credentials.');
      }

      setCurrentUser({
        ...data.user,
        token: data.token
      });
      setPassword('');
      addToast('Administrator signed in successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchDashboardData = async (token?: string) => {
    const activeToken = token || currentUser?.token;
    if (!activeToken) return;

    setLoading(true);
    try {
      const responses = await Promise.all([
        fetch('/api/properties', { headers: getAdminHeaders(activeToken) }),
        fetch('/api/apartments', { headers: getAdminHeaders(activeToken) }),
        fetch('/api/vehicles', { headers: getAdminHeaders(activeToken) }),
        fetch('/api/enquiries', { headers: getAdminHeaders(activeToken) })
      ]);

      if (responses.some(response => response.status === 401)) {
        handleUnauthorized();
        return;
      }

      if (responses.some(response => !response.ok)) {
        throw new Error('One or more dashboard requests failed.');
      }

      const [props, apts, vehs, enqs] = await Promise.all(
        responses.map(response => response.json())
      );

      setProperties(Array.isArray(props) ? props : []);
      setApartments(Array.isArray(apts) ? apts : []);
      setVehicles(Array.isArray(vehs) ? vehs : []);
      setEnquiries(Array.isArray(enqs) ? enqs : []);
    } catch (err) {
      console.error(err);
      addToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      void fetchDashboardData(currentUser.token);
    }
    // We only want to refresh when the stored admin token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.token]);

  // Add Property Handler
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !currentUser?.token) return;

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: getAdminHeaders(undefined, true),
        body: JSON.stringify({
          title: newTitle,
          price: Number(newPrice),
          listingType: newListingType,
          area: newArea,
          location: newLocation,
          propertyType: newType,
          bedrooms: Number(newBeds),
          bathrooms: Number(newBaths),
          parkingSpaces: 4,
          mainImage: newImage,
          images: [newImage],
          description: newDesc,
          shortDescription: newDesc.slice(0, 120) + '...',
          titleDocument: "Governor's Consent",
          features: ['Fitted Kitchen', 'Ensuite Bedrooms', 'Water Treatment', '24/7 Security'],
          isFeatured: true
        })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create property');
      }

      const created = await res.json();
      setProperties(prev => [created, ...prev]);
      setShowAddProperty(false);
      setNewTitle('');
      addToast('New property created successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to add property', 'error');
    }
  };

  // Delete Property Handler
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to delete property');
      }

      setProperties(prev => prev.filter(p => p.id !== id));
      addToast('Property deleted', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete property', 'error');
    }
  };

  // Update Enquiry Status
  const handleUpdateEnquiryStatus = async (id: string, status: 'new' | 'contacted' | 'resolved') => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(undefined, true),
        body: JSON.stringify({ status })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to update enquiry');
      }

      setEnquiries(prev => prev.map(e => (e.id === id ? { ...e, status } : e)));
      addToast(`Enquiry marked as ${status}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update enquiry', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      phone,
      whatsapp,
      email,
      address
    });
    addToast('Company contact settings update requested.', 'success');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep flex items-center justify-center p-6 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
        <div className="w-full max-w-md bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              Selling Ajah Admin
            </h2>
            <p className="text-xs text-neutral-600 dark:text-white/60">
              Sign in with your authorized administrator account to manage inventory and leads.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Enter username or email..."
                className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:border-brand-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:border-brand-gold outline-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-500 dark:text-rose-400">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep disabled:opacity-60 disabled:cursor-not-allowed text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {authLoading ? 'Signing In...' : 'Unlock Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalPortfolioValue = properties.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-brand-black-deep text-neutral-900 dark:text-neutral-100 pb-24 transition-colors duration-200">
      {/* Top Admin Bar */}
      <div className="bg-white dark:bg-brand-black-soft border-b border-black/8 dark:border-white/10 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold text-neutral-900 dark:text-white leading-none">
              Selling Ajah Command Center
            </h1>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Session Active (Full Management Rights)</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-brand-black-deep p-1 rounded-xl border border-black/8 dark:border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'enquiries', label: `Leads (${enquiries.length})`, icon: MessageSquare },
            { id: 'properties', label: `Properties (${properties.length})`, icon: Building2 },
            { id: 'apartments', label: `Shortlets (${apartments.length})`, icon: Key },
            { id: 'vehicles', label: `Vehicles (${vehicles.length})`, icon: Car },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-brand-gold text-brand-black-deep font-bold shadow-sm'
                    : 'text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none">
                <span className="text-xs text-neutral-500 dark:text-white/50 uppercase font-semibold block mb-1">Portfolio Assets</span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-white">{properties.length} Listings</div>
                <span className="text-[11px] text-brand-gold font-mono mt-1 block">Ajah & Lekki Peninsula</span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none">
                <span className="text-xs text-neutral-500 dark:text-white/50 uppercase font-semibold block mb-1">Active Leads / Enquiries</span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400">{enquiries.length} Inquiries</div>
                <span className="text-[11px] text-neutral-500 dark:text-white/50 mt-1 block">Inspection & Booking Requests</span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none">
                <span className="text-xs text-neutral-500 dark:text-white/50 uppercase font-semibold block mb-1">Serviced Units & Cars</span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-gold">{apartments.length + vehicles.length} Units</div>
                <span className="text-[11px] text-neutral-500 dark:text-white/50 mt-1 block">Shortlets & Fleet</span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none">
                <span className="text-xs text-neutral-500 dark:text-white/50 uppercase font-semibold block mb-1">Total Valuation</span>
                <div className="text-lg sm:text-xl font-serif font-bold text-neutral-900 dark:text-white truncate">{formatNaira(totalPortfolioValue)}</div>
                <span className="text-[11px] text-neutral-500 dark:text-white/50 mt-1 block">Gross Inventory Volume</span>
              </div>
            </div>

            {/* Quick Activity Table */}
            <div className="bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Recent Client Inquiries</h3>
                <button
                  onClick={() => setActiveTab('enquiries')}
                  className="text-xs text-brand-gold hover:underline font-semibold cursor-pointer"
                >
                  View All Leads →
                </button>
              </div>

              <div className="divide-y divide-black/8 dark:divide-white/10">
                {enquiries.slice(0, 5).map(enq => (
                  <div key={enq.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white">{enq.name}</span>
                      <span className="text-neutral-500 dark:text-white/50 ml-2 font-mono">{enq.phone}</span>
                      <p className="text-neutral-600 dark:text-white/60 mt-0.5 line-clamp-1">{enq.message}</p>
                    </div>
                    <a
                      href={formatWhatsAppUrl(enq.phone || enq.whatsapp, `Hello ${enq.name}, I am reaching out from Selling Ajah regarding your property enquiry.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENQUIRIES & LEADS */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Client Enquiries & Inspections</h2>
                <p className="text-xs text-neutral-600 dark:text-white/60">All inbound messages from the web application, inspection bookings, and AI advisor.</p>
              </div>
            </div>

            <div className="space-y-3">
              {enquiries.map(enq => (
                <div key={enq.id} className="p-5 rounded-2xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm sm:text-base font-bold text-neutral-900 dark:text-white">{enq.name}</h4>
                      <span className="text-[10px] bg-neutral-100 dark:bg-brand-black-deep text-brand-gold px-2 py-0.5 rounded-full uppercase font-medium border border-black/5 dark:border-white/10">
                        {enq.service}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        enq.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-brand-gold/15 text-brand-gold-deep dark:text-brand-gold border border-brand-gold/30'
                      }`}>
                        {enq.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 dark:text-white/60 flex flex-wrap items-center gap-3">
                      <span>Phone: <a href={`tel:${enq.phone}`} className="text-neutral-800 dark:text-white/80 hover:underline">{enq.phone}</a></span>
                      {enq.email && <span>Email: <a href={`mailto:${enq.email}`} className="text-neutral-800 dark:text-white/80 hover:underline">{enq.email}</a></span>}
                      {enq.propertyTitle && <span className="text-brand-gold font-medium">Listing: {enq.propertyTitle}</span>}
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-white/70 pt-1">
                      {enq.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={formatWhatsAppUrl(enq.phone || enq.whatsapp, `Hello ${enq.name}, I am reaching out from Selling Ajah regarding your enquiry: "${enq.message.slice(0, 50)}..."`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat WhatsApp</span>
                    </a>

                    {enq.status !== 'resolved' ? (
                      <button
                        onClick={() => handleUpdateEnquiryStatus(enq.id, 'resolved')}
                        className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-brand-black-deep dark:hover:bg-white/10 text-neutral-800 dark:text-white/80 text-xs font-semibold border border-black/5 dark:border-white/10 cursor-pointer"
                      >
                        Mark Done
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateEnquiryStatus(enq.id, 'new')}
                        className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-brand-black-deep dark:hover:bg-white/10 text-neutral-600 dark:text-white/60 text-xs border border-black/5 dark:border-white/10 cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROPERTIES CRUD */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Properties Catalog</h2>
                <p className="text-xs text-neutral-600 dark:text-white/60">Manage real estate listings for sale or rent in Ajah & Lekki.</p>
              </div>

              <button
                id="admin-add-property-btn"
                onClick={() => setShowAddProperty(!showAddProperty)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Property</span>
              </button>
            </div>

            {/* Add Property Form Drawer */}
            {showAddProperty && (
              <form onSubmit={handleCreateProperty} className="p-6 bg-white dark:bg-brand-black-soft border border-brand-gold/40 rounded-3xl shadow-xl space-y-4 animate-in fade-in duration-200">
                <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2">Create New Verified Listing</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g., 5 Bed Fully Detached Duplex with Pool"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={e => setNewPrice(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Intent</label>
                    <select
                      value={newListingType}
                      onChange={e => setNewListingType(e.target.value as any)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Area</label>
                    <input
                      type="text"
                      value={newArea}
                      onChange={e => setNewArea(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={newBeds}
                      onChange={e => setNewBeds(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={newBaths}
                      onChange={e => setNewBaths(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={newImage}
                    onChange={e => setNewImage(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProperty(false)}
                    className="px-4 py-2 text-xs text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            )}

            {/* List Table */}
            <div className="divide-y divide-black/8 dark:divide-white/10 bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
              {properties.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={p.mainImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">{p.title}</h4>
                        <span className="text-[10px] text-brand-gold font-mono">{p.refNumber}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-white/60">{p.location} • {formatNaira(p.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/properties/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-brand-black-deep"
                      title="View public page"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteProperty(p.id)}
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-brand-black-deep cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: APARTMENTS CRUD */}
        {activeTab === 'apartments' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Serviced Apartments & Shortlets</h2>
            <div className="divide-y divide-black/8 dark:divide-white/10 bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
              {apartments.map(a => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={a.mainImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">{a.name}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-white/60">{a.location} • {formatNaira(a.pricePerNight)}/night</p>
                    </div>
                  </div>
                  <a
                    href={`/shortlets/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-brand-black-deep"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VEHICLES CRUD */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Luxury Vehicle Fleet</h2>
            <div className="divide-y divide-black/8 dark:divide-white/10 bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={v.mainImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">{v.name}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-white/60">{v.category} • {formatNaira(v.dailyRate)}/day</p>
                    </div>
                  </div>
                  <a
                    href={`/cars/${v.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-brand-black-deep"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-xl bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-6">Company Information</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Official Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Official WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Physical Office Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

