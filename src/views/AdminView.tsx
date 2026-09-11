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
  ShieldCheck,
  X,
  FileText,
  MapPin,
  Sparkles,
  Camera
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
  const [newPricePeriod, setNewPricePeriod] = useState<'per annum' | 'per month' | 'per day'>('per annum');
  const [newPreviousPrice, setNewPreviousPrice] = useState<number | ''>('');
  const [newListingType, setNewListingType] = useState<'sale' | 'rent'>('sale');
  const [newArea, setNewArea] = useState('Ajah');
  const [newLocation, setNewLocation] = useState('Abraham Adesanya Estate, Ajah, Lagos');
  const [newAddress, setNewAddress] = useState('Abraham Adesanya Estate Road');
  const [newType, setNewType] = useState('Detached Duplex');
  const [newBeds, setNewBeds] = useState(4);
  const [newBaths, setNewBaths] = useState(5);
  const [newToilets, setNewToilets] = useState(5);
  const [newParkingSpaces, setNewParkingSpaces] = useState(4);
  const [newPropertySize, setNewPropertySize] = useState('450 sqm');
  const [newLandSize, setNewLandSize] = useState('600 sqm');
  const [newTitleDocument, setNewTitleDocument] = useState("Governor's Consent");
  const [newRefNumber, setNewRefNumber] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [newFeaturesInput, setNewFeaturesInput] = useState('Fitted Kitchen, Ensuite Bedrooms, Water Treatment Plant, 24/7 Security, Stamp Concrete Compound, CCTV');
  const [newDesc, setNewDesc] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newGoogleMapsUrl, setNewGoogleMapsUrl] = useState('');
  const [newIsFeatured, setNewIsFeatured] = useState(true);
  const [newStatus, setNewStatus] = useState<'available' | 'under_offer' | 'sold' | 'rented'>('available');

  // Add Shortlet Modal / Form State
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [aptName, setAptName] = useState('');
  const [aptLocation, setAptLocation] = useState('Chevron Alternative Route, Lekki/Ajah');
  const [aptArea, setAptArea] = useState('Chevron');
  const [aptAddress, setAptAddress] = useState('Orchid Road, Lekki/Ajah');
  const [aptPricePerNight, setAptPricePerNight] = useState(85000);
  const [aptBedrooms, setAptBedrooms] = useState(2);
  const [aptBathrooms, setAptBathrooms] = useState(2);
  const [aptMaxGuests, setAptMaxGuests] = useState(4);
  const [aptCheckInTime, setAptCheckInTime] = useState('2:00 PM');
  const [aptCheckOutTime, setAptCheckOutTime] = useState('11:00 AM');
  const [aptAmenitiesInput, setAptAmenitiesInput] = useState('24/7 Power, Fast WiFi, Swimming Pool, Netflix, Smart TV, Fitted Kitchen, Air Conditioning, Daily Housekeeping, Security');
  const [aptRulesInput, setAptRulesInput] = useState('No Smoking inside, No loud parties after 10PM, Valid ID required at check-in');
  const [aptMainImage, setAptMainImage] = useState('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80');
  const [aptGalleryInput, setAptGalleryInput] = useState('');
  const [aptDesc, setAptDesc] = useState('');
  const [aptIsFeatured, setAptIsFeatured] = useState(true);

  // Add Luxury Vehicle Modal / Form State
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehName, setVehName] = useState('');
  const [vehBrand, setVehBrand] = useState('Mercedes-Benz');
  const [vehModel, setVehModel] = useState('G63 AMG');
  const [vehYear, setVehYear] = useState(2023);
  const [vehCategory, setVehCategory] = useState<'SUV' | 'Sedan' | 'Sports' | 'Exotic' | 'Van'>('SUV');
  const [vehDailyRate, setVehDailyRate] = useState(250000);
  const [vehHourlyRate, setVehHourlyRate] = useState<number | ''>('');
  const [vehTransmission, setVehTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [vehSeats, setVehSeats] = useState(5);
  const [vehFuelType, setVehFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [vehColor, setVehColor] = useState('Obsidian Black');
  const [vehFeaturesInput, setVehFeaturesInput] = useState('Professional Chauffeur, Armed Escort Option, Premium Sound System, Leather Interior, Panoramic Sunroof, Privacy Tint');
  const [vehRequirementsInput, setVehRequirementsInput] = useState('Valid Government ID, Refundable Security Deposit, 24-hour advance booking');
  const [vehMainImage, setVehMainImage] = useState('https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80');
  const [vehGalleryInput, setVehGalleryInput] = useState('');
  const [vehDesc, setVehDesc] = useState('');
  const [vehIsFeatured, setVehIsFeatured] = useState(true);

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

    const gallery = newGalleryInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!gallery.includes(newImage)) {
      gallery.unshift(newImage);
    }
    const features = newFeaturesInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: getAdminHeaders(undefined, true),
        body: JSON.stringify({
          title: newTitle,
          price: Number(newPrice),
          pricePeriod: newListingType === 'rent' ? newPricePeriod : undefined,
          previousPrice: newPreviousPrice ? Number(newPreviousPrice) : undefined,
          listingType: newListingType,
          area: newArea,
          location: newLocation,
          address: newAddress,
          propertyType: newType,
          bedrooms: Number(newBeds),
          bathrooms: Number(newBaths),
          toilets: Number(newToilets),
          parkingSpaces: Number(newParkingSpaces),
          propertySize: newPropertySize,
          landSize: newLandSize,
          refNumber: newRefNumber.trim() || undefined,
          mainImage: newImage,
          images: gallery,
          gallery,
          description: newDesc,
          fullDescription: newDesc,
          shortDescription: newDesc.slice(0, 150) + (newDesc.length > 150 ? '...' : ''),
          titleDocument: newTitleDocument,
          features: features.length > 0 ? features : ['Fitted Kitchen', 'Ensuite Bedrooms', 'Water Treatment', '24/7 Security'],
          amenities: features,
          videoUrl: newVideoUrl || undefined,
          googleMapsUrl: newGoogleMapsUrl || undefined,
          isFeatured: newIsFeatured,
          status: newStatus
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
      setNewDesc('');
      addToast('New property created successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Failed to add property', 'error');
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
      addToast('Property deleted successfully', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete property', 'error');
    }
  };

  // Add Apartment / Shortlet Handler
  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptName || !currentUser?.token) return;

    const gallery = aptGalleryInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!gallery.includes(aptMainImage)) {
      gallery.unshift(aptMainImage);
    }
    const amenities = aptAmenitiesInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const rules = aptRulesInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/apartments', {
        method: 'POST',
        headers: getAdminHeaders(undefined, true),
        body: JSON.stringify({
          name: aptName,
          location: aptLocation,
          area: aptArea,
          address: aptAddress,
          pricePerNight: Number(aptPricePerNight),
          bedrooms: Number(aptBedrooms),
          bathrooms: Number(aptBathrooms),
          maxGuests: Number(aptMaxGuests),
          checkInTime: aptCheckInTime,
          checkOutTime: aptCheckOutTime,
          amenities,
          rules,
          mainImage: aptMainImage,
          gallery,
          description: aptDesc,
          isFeatured: aptIsFeatured,
          status: 'available',
          isAvailable: true
        })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create shortlet');
      }

      const created = await res.json();
      setApartments(prev => [created, ...prev]);
      setShowAddApartment(false);
      setAptName('');
      setAptDesc('');
      addToast('New shortlet created successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Failed to add shortlet', 'error');
    }
  };

  // Delete Apartment Handler
  const handleDeleteApartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shortlet?')) return;

    try {
      const res = await fetch(`/api/apartments/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to delete shortlet');
      }

      setApartments(prev => prev.filter(a => a.id !== id));
      addToast('Shortlet deleted successfully', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete shortlet', 'error');
    }
  };

  // Add Luxury Vehicle Handler
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName || !currentUser?.token) return;

    const gallery = vehGalleryInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!gallery.includes(vehMainImage)) {
      gallery.unshift(vehMainImage);
    }
    const features = vehFeaturesInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const requirements = vehRequirementsInput
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: getAdminHeaders(undefined, true),
        body: JSON.stringify({
          name: vehName,
          brand: vehBrand,
          model: vehModel,
          year: Number(vehYear),
          category: vehCategory,
          dailyRate: Number(vehDailyRate),
          hourlyRate: vehHourlyRate ? Number(vehHourlyRate) : undefined,
          transmission: vehTransmission,
          seats: Number(vehSeats),
          fuelType: vehFuelType,
          color: vehColor,
          features,
          requirements,
          mainImage: vehMainImage,
          gallery,
          description: vehDesc,
          shortDescription: vehDesc.slice(0, 150) + (vehDesc.length > 150 ? '...' : ''),
          isFeatured: vehIsFeatured,
          status: 'available',
          isAvailable: true
        })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create luxury vehicle');
      }

      const created = await res.json();
      setVehicles(prev => [created, ...prev]);
      setShowAddVehicle(false);
      setVehName('');
      setVehDesc('');
      addToast('New luxury vehicle added successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Failed to add luxury vehicle', 'error');
    }
  };

  // Delete Vehicle Handler
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this luxury vehicle?')) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to delete vehicle');
      }

      setVehicles(prev => prev.filter(v => v.id !== id));
      addToast('Vehicle removed from fleet', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete vehicle', 'error');
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
                <p className="text-xs text-neutral-600 dark:text-white/60">Manage real estate listings for sale or rent in Ajah & Lekki Peninsula.</p>
              </div>

              <button
                id="admin-add-property-btn"
                onClick={() => setShowAddProperty(!showAddProperty)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                {showAddProperty ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showAddProperty ? 'Close Form' : 'Add New Property'}</span>
              </button>
            </div>

            {/* Add Property Form Drawer */}
            {showAddProperty && (
              <form onSubmit={handleCreateProperty} className="p-6 bg-white dark:bg-brand-black-soft border border-brand-gold/40 rounded-3xl shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-black/8 dark:border-white/10 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Create Verified Property Listing</h3>
                    <p className="text-xs text-neutral-500 dark:text-white/50">All fields are mapped directly to the Property Detail Page & Supabase.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddProperty(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Listing Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g., 5 Bed Fully Detached Duplex with Swimming Pool & Cinema"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Ref Number (Optional)</label>
                    <input
                      type="text"
                      value={newRefNumber}
                      onChange={e => setNewRefNumber(e.target.value)}
                      placeholder="e.g., SA-AJH-2024"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>

                {/* 2. Pricing & Intent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Listing Intent</label>
                    <select
                      value={newListingType}
                      onChange={e => setNewListingType(e.target.value as any)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Price (₦) *</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={e => setNewPrice(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  {newListingType === 'rent' && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Rental Period</label>
                      <select
                        value={newPricePeriod}
                        onChange={e => setNewPricePeriod(e.target.value as any)}
                        className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                      >
                        <option value="per annum">per annum</option>
                        <option value="per month">per month</option>
                        <option value="per day">per day</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Previous Price (₦)</label>
                    <input
                      type="number"
                      value={newPreviousPrice}
                      onChange={e => setNewPreviousPrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Optional strikethrough price"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Property Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as any)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="under_offer">Under Offer</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>

                {/* 3. Location & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Property Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="Detached Duplex">Detached Duplex</option>
                      <option value="Fully Detached Duplex">Fully Detached Duplex</option>
                      <option value="Semi-Detached Duplex">Semi-Detached Duplex</option>
                      <option value="Terraced Duplex">Terraced Duplex</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Luxury Apartment">Luxury Apartment</option>
                      <option value="Mansion">Mansion</option>
                      <option value="Residential Land">Residential Land</option>
                      <option value="Commercial Property">Commercial Property</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Neighborhood Area</label>
                    <select
                      value={newArea}
                      onChange={e => setNewArea(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="Ajah">Ajah</option>
                      <option value="Abraham Adesanya">Abraham Adesanya</option>
                      <option value="Orchid Road">Orchid Road</option>
                      <option value="VGC">VGC (Victoria Garden City)</option>
                      <option value="Chevron">Chevron</option>
                      <option value="Ikota">Ikota</option>
                      <option value="Sangotedo">Sangotedo</option>
                      <option value="Badore">Badore</option>
                      <option value="Ado Road">Ado Road</option>
                      <option value="Lekki Scheme 2">Lekki Scheme 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Title Document</label>
                    <select
                      value={newTitleDocument}
                      onChange={e => setNewTitleDocument(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="Governor's Consent">Governor's Consent</option>
                      <option value="Certificate of Occupancy (C of O)">Certificate of Occupancy (C of O)</option>
                      <option value="Deed of Assignment">Deed of Assignment</option>
                      <option value="Gazette">Gazette</option>
                      <option value="Governor's Consent in View">Governor's Consent in View</option>
                      <option value="Excision">Excision</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">General Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      placeholder="e.g., Abraham Adesanya Estate, Ajah, Lekki Expressway, Lagos"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Specific Estate Address / Landmark</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      placeholder="e.g., Block 4, Atlantic Palm View Estate, off Lekki-Epe Expressway"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* 4. Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
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

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Toilets</label>
                    <input
                      type="number"
                      value={newToilets}
                      onChange={e => setNewToilets(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Parking</label>
                    <input
                      type="number"
                      value={newParkingSpaces}
                      onChange={e => setNewParkingSpaces(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Floor Area</label>
                    <input
                      type="text"
                      value={newPropertySize}
                      onChange={e => setNewPropertySize(e.target.value)}
                      placeholder="450 sqm"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Land Size</label>
                    <input
                      type="text"
                      value={newLandSize}
                      onChange={e => setNewLandSize(e.target.value)}
                      placeholder="600 sqm"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* 5. Features / Amenities */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Key Features & Amenities (Comma-separated)</label>
                  <input
                    type="text"
                    value={newFeaturesInput}
                    onChange={e => setNewFeaturesInput(e.target.value)}
                    placeholder="e.g. Fitted Kitchen, Ensuite Bedrooms, Water Treatment, Swimming Pool, 24/7 Security, Stamp Concrete, BQ"
                    className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                  />
                </div>

                {/* 6. Media & Photos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Main Cover Photo URL *</label>
                    <input
                      type="url"
                      required
                      value={newImage}
                      onChange={e => setNewImage(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Gallery Photo URLs (One URL per line or comma-separated)</label>
                    <textarea
                      rows={2}
                      value={newGalleryInput}
                      onChange={e => setNewGalleryInput(e.target.value)}
                      placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>

                {/* 7. Full Description */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Comprehensive Property Overview / Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Provide a full, engaging description detailing the interior layout, architecture, luxury finishes, estate environment, neighborhood road access, power security, and investment appreciation potential..."
                    className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold leading-relaxed"
                  />
                </div>

                {/* 8. Links & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">YouTube / Video Tour URL (Optional)</label>
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={e => setNewVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Google Maps Pin URL (Optional)</label>
                    <input
                      type="url"
                      value={newGoogleMapsUrl}
                      onChange={e => setNewGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/8 dark:border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-800 dark:text-white/90">
                    <input
                      type="checkbox"
                      checked={newIsFeatured}
                      onChange={e => setNewIsFeatured(e.target.checked)}
                      className="rounded accent-brand-gold w-4 h-4"
                    />
                    <span>Highlight as Featured Showcase Listing</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddProperty(false)}
                      className="px-4 py-2 text-xs text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish to Supabase</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List Table */}
            <div className="divide-y divide-black/8 dark:divide-white/10 bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
              {properties.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.mainImage} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm truncate">{p.title}</h4>
                        <span className="text-[10px] text-brand-gold font-mono shrink-0">{p.refNumber}</span>
                        {p.isFeatured && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold font-bold uppercase tracking-wider">Featured</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-white/60 truncate mt-0.5">
                        {p.location} • <strong className="text-neutral-900 dark:text-white font-semibold">{formatNaira(p.price)}</strong> {p.listingType === 'rent' ? (p.pricePeriod || '/yr') : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/properties/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-brand-black-deep"
                      title="View live property page"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteProperty(p.id)}
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-brand-black-deep cursor-pointer"
                      title="Delete property listing"
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Serviced Apartments & Shortlets</h2>
                <p className="text-xs text-neutral-600 dark:text-white/60">Manage luxury serviced shortlet residences with 24/7 power & security in Ajah.</p>
              </div>

              <button
                id="admin-add-apartment-btn"
                onClick={() => setShowAddApartment(!showAddApartment)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                {showAddApartment ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showAddApartment ? 'Close Form' : 'Add New Shortlet'}</span>
              </button>
            </div>

            {/* Add Apartment Form Drawer */}
            {showAddApartment && (
              <form onSubmit={handleCreateApartment} className="p-6 bg-white dark:bg-brand-black-soft border border-brand-gold/40 rounded-3xl shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-black/8 dark:border-white/10 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Register New Serviced Shortlet</h3>
                    <p className="text-xs text-neutral-500 dark:text-white/50">Persists directly to Supabase shortlets inventory.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddApartment(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Apartment Name *</label>
                    <input
                      type="text"
                      required
                      value={aptName}
                      onChange={e => setAptName(e.target.value)}
                      placeholder="e.g., The Sapphire 2-Bed Luxury Shortlet"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Price Per Night (₦) *</label>
                    <input
                      type="number"
                      required
                      value={aptPricePerNight}
                      onChange={e => setAptPricePerNight(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Area</label>
                    <select
                      value={aptArea}
                      onChange={e => setAptArea(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="Ajah">Ajah</option>
                      <option value="Chevron">Chevron</option>
                      <option value="Orchid Road">Orchid Road</option>
                      <option value="Ikota">Ikota</option>
                      <option value="Abraham Adesanya">Abraham Adesanya</option>
                      <option value="Sangotedo">Sangotedo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">General Location</label>
                    <input
                      type="text"
                      value={aptLocation}
                      onChange={e => setAptLocation(e.target.value)}
                      placeholder="e.g., Chevron Alternative Route, Lekki/Ajah"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Address / Estate</label>
                    <input
                      type="text"
                      value={aptAddress}
                      onChange={e => setAptAddress(e.target.value)}
                      placeholder="e.g., Orchid Road, Lekki/Ajah"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={aptBedrooms}
                      onChange={e => setAptBedrooms(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={aptBathrooms}
                      onChange={e => setAptBathrooms(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Max Guests</label>
                    <input
                      type="number"
                      value={aptMaxGuests}
                      onChange={e => setAptMaxGuests(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Check-in Time</label>
                    <input
                      type="text"
                      value={aptCheckInTime}
                      onChange={e => setAptCheckInTime(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Check-out Time</label>
                    <input
                      type="text"
                      value={aptCheckOutTime}
                      onChange={e => setAptCheckOutTime(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Amenities (Comma-separated)</label>
                    <input
                      type="text"
                      value={aptAmenitiesInput}
                      onChange={e => setAptAmenitiesInput(e.target.value)}
                      placeholder="24/7 Power, Fast WiFi, Swimming Pool, Netflix, Smart TV, Fitted Kitchen, Air Conditioning"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">House Rules (Comma-separated)</label>
                    <input
                      type="text"
                      value={aptRulesInput}
                      onChange={e => setAptRulesInput(e.target.value)}
                      placeholder="No Smoking inside, No loud parties after 10PM, Valid ID required at check-in"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Cover Photo URL *</label>
                    <input
                      type="url"
                      required
                      value={aptMainImage}
                      onChange={e => setAptMainImage(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Gallery Photo URLs (One URL per line or comma-separated)</label>
                    <textarea
                      rows={2}
                      value={aptGalleryInput}
                      onChange={e => setAptGalleryInput(e.target.value)}
                      placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Description / Guest Overview</label>
                  <textarea
                    rows={3}
                    value={aptDesc}
                    onChange={e => setAptDesc(e.target.value)}
                    placeholder="Describe the apartment layout, serenity, uninterrupted power supply, Netflix and streaming capabilities, security guards, and proximity to Lekki/Ajah hotspots..."
                    className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/8 dark:border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-800 dark:text-white/90">
                    <input
                      type="checkbox"
                      checked={aptIsFeatured}
                      onChange={e => setAptIsFeatured(e.target.checked)}
                      className="rounded accent-brand-gold w-4 h-4"
                    />
                    <span>Highlight as Featured Shortlet</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddApartment(false)}
                      className="px-4 py-2 text-xs text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Shortlet to Supabase</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List Table */}
            <div className="divide-y divide-black/8 dark:divide-white/10 bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
              {apartments.map(a => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={a.mainImage} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm truncate">{a.name}</h4>
                        <span className="text-[10px] text-brand-gold font-medium">{a.bedrooms} Bed • {a.bathrooms} Bath</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-white/60 truncate mt-0.5">
                        {a.location} • <strong className="text-neutral-900 dark:text-white font-semibold">{formatNaira(a.pricePerNight)}</strong> /night
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/shortlets/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-brand-black-deep"
                      title="View public shortlet page"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteApartment(a.id)}
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-brand-black-deep cursor-pointer"
                      title="Delete shortlet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VEHICLES CRUD */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Luxury Vehicle Fleet</h2>
                <p className="text-xs text-neutral-600 dark:text-white/60">Manage chauffeur-driven luxury SUVs, sedans, and exotic car rentals.</p>
              </div>

              <button
                id="admin-add-vehicle-btn"
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                {showAddVehicle ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showAddVehicle ? 'Close Form' : 'Add New Luxury Car'}</span>
              </button>
            </div>

            {/* Add Vehicle Form Drawer */}
            {showAddVehicle && (
              <form onSubmit={handleCreateVehicle} className="p-6 bg-white dark:bg-brand-black-soft border border-brand-gold/40 rounded-3xl shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-black/8 dark:border-white/10 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Add Luxury Vehicle to Fleet</h3>
                    <p className="text-xs text-neutral-500 dark:text-white/50">Persists directly to Supabase fleet repository.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Vehicle Name *</label>
                    <input
                      type="text"
                      required
                      value={vehName}
                      onChange={e => setVehName(e.target.value)}
                      placeholder="e.g., Mercedes-Benz G63 AMG Edition 1"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Brand *</label>
                    <input
                      type="text"
                      required
                      value={vehBrand}
                      onChange={e => setVehBrand(e.target.value)}
                      placeholder="Mercedes-Benz, Rolls-Royce, Range Rover, etc."
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Model</label>
                    <input
                      type="text"
                      value={vehModel}
                      onChange={e => setVehModel(e.target.value)}
                      placeholder="G63 AMG"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Year</label>
                    <input
                      type="number"
                      value={vehYear}
                      onChange={e => setVehYear(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Daily Rate (₦) *</label>
                    <input
                      type="number"
                      required
                      value={vehDailyRate}
                      onChange={e => setVehDailyRate(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Hourly Rate (₦, Optional)</label>
                    <input
                      type="number"
                      value={vehHourlyRate}
                      onChange={e => setVehHourlyRate(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Optional"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Category</label>
                    <select
                      value={vehCategory}
                      onChange={e => setVehCategory(e.target.value as any)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Sports">Sports</option>
                      <option value="Exotic">Exotic</option>
                      <option value="Van">Van / Bus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Transmission</label>
                    <select
                      value={vehTransmission}
                      onChange={e => setVehTransmission(e.target.value as any)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Seats</label>
                    <input
                      type="number"
                      value={vehSeats}
                      onChange={e => setVehSeats(Number(e.target.value))}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Fuel Type</label>
                    <select
                      value={vehFuelType}
                      onChange={e => setVehFuelType(e.target.value as any)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Exterior Color</label>
                    <input
                      type="text"
                      value={vehColor}
                      onChange={e => setVehColor(e.target.value)}
                      placeholder="Obsidian Black"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Vehicle Features (Comma-separated)</label>
                    <input
                      type="text"
                      value={vehFeaturesInput}
                      onChange={e => setVehFeaturesInput(e.target.value)}
                      placeholder="Professional Chauffeur, Armed Escort Option, Premium Sound System, Leather Interior, Panoramic Sunroof, Privacy Tint"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Rental Requirements (Comma-separated)</label>
                    <input
                      type="text"
                      value={vehRequirementsInput}
                      onChange={e => setVehRequirementsInput(e.target.value)}
                      placeholder="Valid Government ID, Refundable Security Deposit, 24-hour advance booking"
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Cover Photo URL *</label>
                    <input
                      type="url"
                      required
                      value={vehMainImage}
                      onChange={e => setNewImage(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Gallery Photo URLs (One URL per line or comma-separated)</label>
                    <textarea
                      rows={2}
                      value={vehGalleryInput}
                      onChange={e => setVehGalleryInput(e.target.value)}
                      placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                      className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-white/70 mb-1">Vehicle Description & Rental Experience</label>
                  <textarea
                    rows={3}
                    value={vehDesc}
                    onChange={e => setVehDesc(e.target.value)}
                    placeholder="Highlight comfort, prestige, chauffeur etiquette, VIP security convoy escort availability, and airport transfer readiness..."
                    className="w-full bg-neutral-100 dark:bg-brand-black-deep border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-gold leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/8 dark:border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-800 dark:text-white/90">
                    <input
                      type="checkbox"
                      checked={vehIsFeatured}
                      onChange={e => setVehIsFeatured(e.target.checked)}
                      className="rounded accent-brand-gold w-4 h-4"
                    />
                    <span>Highlight as Featured Fleet Vehicle</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(false)}
                      className="px-4 py-2 text-xs text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-black-deep font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Vehicle to Fleet</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List Table */}
            <div className="divide-y divide-black/8 dark:divide-white/10 bg-white dark:bg-brand-black-soft border border-black/8 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={v.mainImage} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm truncate">{v.name}</h4>
                        <span className="text-[10px] text-brand-gold font-medium">{v.year} • {v.category}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-white/60 truncate mt-0.5">
                        {v.transmission} • {v.seats} Seats • <strong className="text-neutral-900 dark:text-white font-semibold">{formatNaira(v.dailyRate)}</strong> /day
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/cars/${v.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-brand-black-deep"
                      title="View public vehicle page"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-2 rounded-lg text-neutral-500 dark:text-white/60 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-brand-black-deep cursor-pointer"
                      title="Remove vehicle from fleet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

