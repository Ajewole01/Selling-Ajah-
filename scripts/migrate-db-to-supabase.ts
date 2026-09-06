import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env or .env.local if present
dotenv.config();
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ ERROR: Missing Supabase credentials.');
  console.error(
    'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env or .env.local file.'
  );
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function runMigration() {
  console.log('====================================================');
  console.log('  SELLING AJAH — DATABASE MIGRATION TO SUPABASE     ');
  console.log('====================================================\n');

  const dbPath = path.join(
    process.cwd(),
    'data',
    'db.json'
  );

  if (!fs.existsSync(dbPath)) {
    console.error(
      `❌ Cannot find source database at ${dbPath}`
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, 'utf8');
  const source = JSON.parse(raw);

  console.log('Source data loaded from data/db.json:');
  console.log(
    `- Properties:   ${source.properties?.length || 0}`
  );
  console.log(
    `- Apartments:   ${source.apartments?.length || 0}`
  );
  console.log(
    `- Vehicles:     ${source.vehicles?.length || 0}`
  );
  console.log(
    `- Enquiries:    ${source.enquiries?.length || 0}`
  );
  console.log(
    `- Testimonials: ${source.testimonials?.length || 0}`
  );
  console.log(
    `- FAQs:         ${source.faqs?.length || 0}`
  );
  console.log(
    `- Admin Users:  ${source.users?.length || 0}`
  );
  console.log(
    `- Settings:     ${source.settings ? 'Present' : 'None'}\n`
  );

  // =========================================================
  // 1. PROPERTIES
  // =========================================================

  console.log('⏳ Migrating Properties...');

  const propRows = (source.properties || []).map(
    (p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      ref_number: p.refNumber || null,
      short_description: p.shortDescription || null,
      full_description: p.fullDescription || null,
      property_type: p.propertyType || null,
      listing_type: p.listingType || 'sale',
      price: p.price,
      previous_price: p.previousPrice ?? null,
      price_period: p.pricePeriod || null,
      location: p.location || null,
      area: p.area || null,
      address: p.address || null,
      bedrooms: p.bedrooms ?? 0,
      bathrooms: p.bathrooms ?? 0,
      toilets: p.toilets ?? 0,
      parking_spaces: p.parkingSpaces ?? 0,
      property_size: p.propertySize || null,
      land_size: p.landSize || null,
      amenities: p.amenities || [],
      features: p.features || [],
      google_maps_url: p.googleMapsUrl || null,
      video_url: p.videoUrl || null,
      main_image: p.mainImage || null,
      gallery: p.gallery || [],
      status: p.status || 'available',
      is_featured: Boolean(p.isFeatured),
      seo_title: p.seoTitle || null,
      seo_description: p.seoDescription || null,
      created_at:
        p.createdAt || new Date().toISOString(),
      updated_at:
        p.updatedAt ||
        p.createdAt ||
        new Date().toISOString(),
    })
  );

  if (propRows.length > 0) {
    const { error: propErr } = await supabase
      .from('properties')
      .upsert(propRows, {
        onConflict: 'id',
      });

    if (propErr) {
      console.error(
        '❌ Failed to migrate properties:',
        propErr
      );
      process.exit(1);
    }
  }

  console.log(
    `✅ Properties migrated successfully: ${propRows.length} records.`
  );

  // =========================================================
  // 2. APARTMENTS / SHORTLETS
  // =========================================================

  console.log(
    '⏳ Migrating Apartments / Shortlets...'
  );

  const aptRows = (source.apartments || []).map(
    (a: any) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      location: a.location || null,
      area: a.area || null,
      address: a.address || null,
      price_per_night: a.pricePerNight,
      bedrooms: a.bedrooms ?? 0,
      bathrooms: a.bathrooms ?? 0,
      max_guests: a.maxGuests ?? 1,
      amenities: a.amenities || [],
      rules: a.rules || [],
      check_in_time: a.checkInTime || null,
      check_out_time: a.checkOutTime || null,
      is_available:
        a.isAvailable !== undefined
          ? Boolean(a.isAvailable)
          : true,
      status: a.status || 'available',
      is_featured: Boolean(a.isFeatured),
      description: a.description || null,
      main_image: a.mainImage || null,
      gallery: a.gallery || [],
      seo_title: a.seoTitle || null,
      seo_description: a.seoDescription || null,
      created_at:
        a.createdAt || new Date().toISOString(),
    })
  );

  if (aptRows.length > 0) {
    const { error: aptErr } = await supabase
      .from('apartments')
      .upsert(aptRows, {
        onConflict: 'id',
      });

    if (aptErr) {
      console.error(
        '❌ Failed to migrate apartments:',
        aptErr
      );
      process.exit(1);
    }
  }

  console.log(
    `✅ Apartments migrated successfully: ${aptRows.length} records.`
  );

  // =========================================================
  // 3. VEHICLES
  // =========================================================

  console.log('⏳ Migrating Luxury Vehicles...');

  const vehRows = (source.vehicles || []).map(
    (v: any) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      brand: v.brand || null,
      model: v.model || null,
      year: v.year ?? null,
      category: v.category || null,
      daily_rate: v.dailyRate,
      hourly_rate: v.hourlyRate ?? null,
      transmission: v.transmission || null,
      seats: v.seats ?? 4,
      fuel_type: v.fuelType || null,
      color: v.color || null,
      features: v.features || [],
      requirements: v.requirements || [],
      status: v.status || 'available',
      is_available:
        v.isAvailable !== undefined
          ? Boolean(v.isAvailable)
          : true,
      is_featured: Boolean(v.isFeatured),
      main_image: v.mainImage || null,
      gallery: v.gallery || [],
      description: v.description || null,
      short_description:
        v.shortDescription || null,
      seo_title: v.seoTitle || null,
      seo_description: v.seoDescription || null,
      created_at:
        v.createdAt || new Date().toISOString(),
    })
  );

  if (vehRows.length > 0) {
    const { error: vehErr } = await supabase
      .from('vehicles')
      .upsert(vehRows, {
        onConflict: 'id',
      });

    if (vehErr) {
      console.error(
        '❌ Failed to migrate vehicles:',
        vehErr
      );
      process.exit(1);
    }
  }

  console.log(
    `✅ Vehicles migrated successfully: ${vehRows.length} records.`
  );

  // =========================================================
  // 4. ENQUIRIES
  // =========================================================

  console.log('⏳ Migrating Enquiries...');

  const enqRows = (source.enquiries || []).map(
    (e: any) => ({
      id: e.id,
      name: e.name,
      phone: e.phone || null,
      email: e.email || null,
      whatsapp: e.whatsapp || null,
      service: e.service || 'general',
      property_id: e.propertyId || null,
      property_title: e.propertyTitle || null,
      listing_type: e.listingType || null,
      listing_id: e.listingId || null,
      listing_title: e.listingTitle || null,
      budget: e.budget || null,
      preferred_location:
        e.preferredLocation || null,
      message: e.message || null,
      status: e.status || 'new',
      notes: e.notes || null,
      date:
        e.date || new Date().toISOString(),
      created_at:
        e.createdAt ||
        e.date ||
        new Date().toISOString(),
    })
  );

  if (enqRows.length > 0) {
    const { error: enqErr } = await supabase
      .from('enquiries')
      .upsert(enqRows, {
        onConflict: 'id',
      });

    if (enqErr) {
      console.error(
        '❌ Failed to migrate enquiries:',
        enqErr
      );
      process.exit(1);
    }
  }

  console.log(
    `✅ Enquiries migrated successfully: ${enqRows.length} records.`
  );

  // =========================================================
  // 5. TESTIMONIALS
  // =========================================================

  console.log('⏳ Migrating Testimonials...');

  const testRows = (source.testimonials || []).map(
    (t: any) => ({
      id: t.id,
      name: t.name,
      role: t.role || null,
      avatar: t.avatar || null,
      rating: t.rating ?? 5,
      text: t.text,
      service_or_property:
        t.serviceOrProperty || null,
      is_featured:
        t.isFeatured !== undefined
          ? Boolean(t.isFeatured)
          : true,
      created_at:
        t.createdAt || new Date().toISOString(),
    })
  );

  if (testRows.length > 0) {
    const { error: testErr } = await supabase
      .from('testimonials')
      .upsert(testRows, {
        onConflict: 'id',
      });

    if (testErr) {
      console.error(
        '❌ Failed to migrate testimonials:',
        testErr
      );
      process.exit(1);
    }
  }

  console.log(
    `✅ Testimonials migrated successfully: ${testRows.length} records.`
  );

  // =========================================================
  // 6. FAQS
  // =========================================================

  console.log('⏳ Migrating FAQs...');

  const faqRows = (source.faqs || []).map(
    (f: any) => ({
      id: f.id,
      category: f.category || null,
      question: f.question,
      answer: f.answer,
    })
  );

  if (faqRows.length > 0) {
    const { error: faqErr } = await supabase
      .from('faqs')
      .upsert(faqRows, {
        onConflict: 'id',
      });

    if (faqErr) {
      console.error(
        '❌ Failed to migrate faqs:',
        faqErr
      );
      process.exit(1);
    }
  }

  console.log(
    `✅ FAQs migrated successfully: ${faqRows.length} records.`
  );

  // =========================================================
  // 7. SITE SETTINGS
  // =========================================================

  console.log('⏳ Migrating Site Settings...');

  const s = source.settings || {};

  const settingsRow = {
    id: 'default',
    business_name:
      s.businessName || 'Selling Ajah',

    phone:
      s.phone || '+234 810 901 2192',

    whatsapp:
      s.whatsapp || '+234 810 901 2192',

    email:
      s.email || null,

    office_address:
      s.officeAddress || null,

    business_hours:
      s.businessHours || null,

    social_links:
      s.socialLinks || {},

    default_seo_title:
      s.defaultSeoTitle || null,

    default_seo_description:
      s.defaultSeoDescription || null,

    hero_headline:
      s.heroHeadline || null,

    hero_subheadline:
      s.heroSubheadline || null,

    updated_at:
      new Date().toISOString(),
  };

  const { error: setErr } = await supabase
    .from('site_settings')
    .upsert([settingsRow], {
      onConflict: 'id',
    });

  if (setErr) {
    console.error(
      '❌ Failed to migrate site settings:',
      setErr
    );
    process.exit(1);
  }

  console.log(
    '✅ Site settings migrated successfully.'
  );

  // =========================================================
// 8. ADMIN USERS
// =========================================================

console.log('⏳ Migrating Admin Users...');

const userRows = await Promise.all(
  (source.users || []).map(async (u: any) => {
    const existingPassword = String(
      u.passwordHash || ''
    );

    // If it already looks like bcrypt, preserve it.
    // Otherwise hash the existing legacy password.
    const passwordHash =
      existingPassword.startsWith('$2a$') ||
      existingPassword.startsWith('$2b$') ||
      existingPassword.startsWith('$2y$')
        ? existingPassword
        : await bcrypt.hash(existingPassword, 12);

    return {
      id: u.id,
      username: String(u.username)
        .trim()
        .toLowerCase(),
      name: u.name || null,
      email: String(u.email || '')
        .trim()
        .toLowerCase(),
      role: u.role || 'admin',
      password_hash: passwordHash,
      created_at:
        u.createdAt || new Date().toISOString()
    };
  })
);

if (userRows.length > 0) {
  const { error: userErr } = await supabase
    .from('admin_users')
    .upsert(userRows, {
      onConflict: 'id'
    });

  if (userErr) {
    console.error(
      '❌ Failed to migrate admin users:',
      userErr
    );
    process.exit(1);
  }
}

console.log(
  `✅ Admin users migrated successfully: ${userRows.length} records.`
);

  // =========================================================
  // VERIFICATION
  // =========================================================

  console.log(
    '\n===================================================='
  );
  console.log(
    '  FINAL VERIFICATION COUNTS IN SUPABASE             '
  );
  console.log(
    '===================================================='
  );

  const [
    propResult,
    aptResult,
    vehResult,
    enqResult,
    testResult,
    faqResult,
    userResult,
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('apartments')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('vehicles')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('enquiries')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('testimonials')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('faqs')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('admin_users')
      .select('*', {
        count: 'exact',
        head: true,
      }),
  ]);

  console.log(
    `- Properties:   Source ${
      source.properties?.length || 0
    }  --> Supabase ${propResult.count}`
  );

  console.log(
    `- Apartments:   Source ${
      source.apartments?.length || 0
    }  --> Supabase ${aptResult.count}`
  );

  console.log(
    `- Vehicles:     Source ${
      source.vehicles?.length || 0
    }  --> Supabase ${vehResult.count}`
  );

  console.log(
    `- Enquiries:    Source ${
      source.enquiries?.length || 0
    }  --> Supabase ${enqResult.count}`
  );

  console.log(
    `- Testimonials: Source ${
      source.testimonials?.length || 0
    }  --> Supabase ${testResult.count}`
  );

  console.log(
    `- FAQs:         Source ${
      source.faqs?.length || 0
    }  --> Supabase ${faqResult.count}`
  );

  console.log(
    `- Admin Users:  Source ${
      source.users?.length || 0
    }  --> Supabase ${userResult.count}`
  );

  console.log(
    '\n🎉 DATABASE MIGRATION COMPLETED.'
  );
  console.log(
    'Check the source and Supabase counts above before moving to production.'
  );
}

runMigration().catch((err) => {
  console.error(
    '❌ Migration failed with unhandled error:',
    err
  );
  process.exit(1);
});