# Project Overview, Architecture & Tech Stack: Fauji Properties

This document provides a complete technical analysis of the **Fauji Properties** codebase. Any developer or AI coding assistant (Cursor, Windsurf, VS Code, Claude Code, Copilot, Antigravity, etc.) can read this single file to understand the architecture, tech stack, data models, and end-to-end execution flows without needing to re-analyze the workspace.

---

## 1. Executive Summary & Business Domain

- **Application Name**: Fauji Properties (`property-website`)
- **Domain**: Real estate listing and lead generation portal for homes, villas, plots, lands, and commercial spaces (primarily focused on Hyderabad / Ambala / Telangana).
- **Target Audience**: 
  - **Public Visitors**: Homebuyers and investors looking for verified properties, comparing options, saving favorites, and sending inquiries directly or via WhatsApp.
  - **Administrators**: Agency admins managing listings, uploading media to Cloudinary, tracking customer inquiries through a sales pipeline, and managing company branding/contact settings.

---

## 2. Complete Technology Stack & Specifications

| Layer / Concern | Technology | Exact Version | Purpose & Architecture Role |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** (App Router) | `16.3.1` | Full-stack React framework with Server Components, React Server Actions (`"use server"`), Route Handlers (`app/api`), and edge/node middleware. |
| **UI Library** | **React** / **React DOM** | `19.2.8` | Component model utilizing React 19 features including `useActionState`, `useSyncExternalStore`, and Server Actions. |
| **Language** | **TypeScript** | `^5.x` | Strict type checking with unified interfaces across database schemas and frontend models. |
| **Styling** | **Tailwind CSS v4** | `^4.x` | Modern utility-first CSS using `@tailwindcss/postcss` and native `@import "tailwindcss";`. Custom design system defined in `app/globals.css`. |
| **Animation** | **Framer Motion** | `^13.1.1` | Smooth micro-animations, page entry/exit reveals, and interactive transitions. |
| **Database & Auth** | **Supabase (PostgreSQL)** | `@supabase/supabase-js: ^2.112.3`<br>`@supabase/ssr: ^0.12.4`<br>`supabase CLI: ^2.115.0` | Managed PostgreSQL database, Row Level Security (RLS) policies, Stored Procedures (PL/pgSQL), and Supabase GoTrue Auth with SSR cookie persistence. |
| **Cloud Media** | **Cloudinary** | `cloudinary: ^2.10.1` | Cloud image storage and optimization. Client-side direct preset uploads + server-side automated cleanup/deletion upon property deletion. |
| **Transactional Email** | **Resend** | `resend: ^6.26.0` | Transactional email delivery notifying admins instantly upon lead submission with atomic DB claiming. |
| **Typography & Fonts** | **Geist** (`next/font/google`) | Built-in | Variable modern typography loaded directly via Next.js Font Optimization. |
| **Package Management**| **npm** / **pnpm** | `pnpm-workspace.yaml` | Node.js ecosystem dependencies with strict lockfiles. |

---

## 3. Directory Structure & File Map

```text
property-website/
├── app/                                # Next.js App Router root
│   ├── about/page.tsx                  # Company About page (reads dynamic business settings)
│   ├── admin/                          # Protected Admin Portal
│   │   ├── dashboard/page.tsx          # Dashboard redirect/view
│   │   ├── enquiries/page.tsx          # Admin Inquiries listing & pipeline status manager
│   │   ├── login/page.tsx              # Admin authentication login page
│   │   ├── properties/page.tsx         # Property CRUD dashboard with search/filters & modal form
│   │   ├── settings/page.tsx           # Company details, WhatsApp/Maps, and Admin password/email
│   │   ├── layout.tsx / page.tsx       # Main Admin overview dashboard with business KPIs
│   │   └── loading.tsx                 # Admin loading state
│   ├── api/                            # Backend Route Handlers
│   │   ├── admin/login/route.ts        # Admin login API with Remember Me & Session cookie control
│   │   ├── admin/logout/route.ts       # Admin logout API invalidating sessions & clearing cookies
│   │   ├── admin/session/route.ts      # Admin session validation endpoint (used for inactivity ping)
│   │   └── properties/route.ts         # Public endpoint to fetch multiple properties by IDs (for Comparison)
│   ├── compare/page.tsx                # Side-by-side property comparison page (up to 3 items)
│   ├── contact/page.tsx                # Contact page with dynamic business details & inquiry form
│   ├── properties/                     # Public Property Listings
│   │   ├── page.tsx                    # Searchable, filterable property catalog
│   │   ├── loading.tsx                 # Fallback skeleton for property search
│   │   └── [id]/                       # Dynamic property details route (slug-based)
│   │       ├── page.tsx                # Single property detail page + dynamic SEO metadata
│   │       ├── not-found.tsx           # Custom 404 for invalid property slugs
│   │       └── error.tsx               # Route error boundary
│   ├── favicon.ico, icon.svg           # Brand favicons
│   ├── globals.css                     # Tailwind v4 import, custom brand tokens, view-transitions
│   ├── layout.tsx                      # Root layout wrapping the app in ComparisonProvider & Geist font
│   └── template.tsx                    # Root template for client transitions
│
├── components/                         # Modular React UI Components
│   ├── admin/                          # Admin-only interactive components
│   │   ├── AdminBusinessSettingsForm.tsx # Form for updating company name, contact, map URL
│   │   ├── AdminEnquiriesClient.tsx    # Interactive inquiry management table with status dropdown & delete
│   │   ├── AdminLoginForm.tsx          # Login form with email, password, and Remember Me toggle
│   │   ├── AdminPropertiesClient.tsx   # Table of properties with search, sort, filter, and modal triggers
│   │   ├── AdminPropertyForm.tsx       # Complex property creation/editing form with Cloudinary multi-upload
│   │   ├── AdminSecurityForm.tsx       # Change admin email & password form
│   │   └── AdminSidebar.tsx            # Admin navigation bar + auto-logout after inactivity timer
│   ├── comparison/                     # Property Comparison Components
│   │   ├── CompareButton.tsx           # Toggle button to add/remove property to comparison
│   │   ├── ComparisonPage.tsx          # Side-by-side spec comparison table with difference highlighting
│   │   └── ComparisonProvider.tsx      # React Context + localStorage state manager for comparison list
│   ├── EnquiryForm.tsx                 # Public lead capture form (React 19 useActionState)
│   ├── Footer.tsx                      # Global footer with dynamic company info
│   ├── Header.tsx                      # Global navigation bar with links, comparison badge, and contact CTA
│   ├── PropertyCard.tsx                # Reusable property card with status badge, pricing, and specs
│   ├── PropertyDetail.tsx              # Comprehensive property view with gallery, specs, and WhatsApp CTA
│   ├── PropertyGallery.tsx             # Interactive image carousel/lightbox for property images
│   ├── PropertyGrid.tsx                # Responsive CSS grid wrapper for property cards
│   ├── PropertyListings.tsx            # Client-side property filter & search engine (price, area, BHK, type)
│   ├── SavePropertyButton.tsx          # Star button persisting favorite properties to localStorage
│   ├── SearchBar.tsx                   # Homepage hero search bar with pre-configured filters
│   ├── SectionHeading.tsx              # Reusable section title with eyebrow & subtitle
│   └── WhatsAppButton.tsx              # Floating WhatsApp quick-action button with pre-filled message
│
├── data/
│   └── company.ts                      # Default fallback company details, phone, and address
│
├── lib/                                # Business Logic, Services, and Helpers
│   ├── cloudinary.ts                   # Cloudinary server SDK config & destroy helper
│   ├── statusStyles.ts                 # Color badge mappings for Property & Enquiry statuses
│   ├── enquiries/
│   │   ├── actions.ts                  # Server Actions: createEnquiryAction, updateEnquiryStatusAction, deleteEnquiryAction
│   │   ├── notifications.ts            # Email dispatcher via Resend with DB idempotent claiming
│   │   └── service.ts                  # Query services for enquiries and dashboard stats
│   ├── properties/
│   │   ├── actions.ts                  # Server Actions: createPropertyAction, updatePropertyAction, deletePropertyAction, deletePropertyImageAction
│   │   ├── service.ts                  # DB queries: getProperties, getPropertiesByIds, getPropertyBySlug, getFeaturedProperties, getRelatedProperties
│   │   └── types.ts                    # TypeScript types & database row mapping functions
│   ├── settings/
│   │   ├── actions.ts                  # Server Actions: updateBusinessSettingsAction, changeAdminPasswordAction, changeAdminEmailAction
│   │   └── service.ts                  # Settings queries: getBusinessSettings (admin), getPublicBusinessSettings (cached/anon)
│   └── supabase/
│       ├── constants.ts                # Session cookie constants (`admin-session-mode`)
│       ├── proxy.ts                    # Edge-compatible middleware session refresher & route guard
│       └── server.ts                   # Server-side Supabase client creators (anon SSR client & verified admin client)
│
├── middleware.ts                       # Next.js route middleware protecting `/admin` and subpaths
├── scripts/
│   └── assign-admin-role.mjs           # Node CLI utility to grant `app_metadata.role = 'admin'` to a user
├── supabase/
│   ├── config.toml                     # Local Supabase configuration
│   └── migrations/                     # 11 SQL migration files defining schemas, indexes, and RLS policies
├── .env.example                        # Documented environment variable template
├── .env.local                          # Active local environment variables
├── next.config.ts                      # Next.js configuration (allowedDevOrigins, remote image patterns)
├── package.json                        # Dependency definitions and scripts
├── postcss.config.mjs                  # PostCSS plugins (@tailwindcss/postcss)
└── tsconfig.json                       # TypeScript compiler options & `@/*` path mapping
```

---

## 4. Database Architecture & Row-Level Security (RLS)

The database runs on PostgreSQL managed through Supabase.

### 4.1 Tables & Schema

1. **`public.properties`**
   - `id` (UUID, Primary Key, default `gen_random_uuid()`)
   - `title` (TEXT, Required)
   - `slug` (TEXT, Unique, Required, auto-generated from title + random suffix)
   - `description` (TEXT, Required)
   - `property_type` (TEXT: `Land`, `Villa`, `House`, `Apartment`, `Commercial`, `Plot`)
   - `price` (TEXT: Formatted string e.g. "₹85 Lakhs")
   - `price_lakhs` (NUMERIC: Numeric value used for filtering and sorting)
   - `location` (TEXT: Locality / Area)
   - `city` (TEXT: City name)
   - `state` (TEXT: Default "Telangana")
   - `area` (TEXT: e.g. "1800 sq.ft." or "200 sq.yards")
   - `facing` (TEXT, Nullable: e.g. "East", "North-East")
   - `dimensions` (TEXT, Nullable: e.g. "30 x 60 ft")
   - `bedrooms` (INTEGER, Nullable)
   - `bathrooms` (INTEGER, Nullable)
   - `parking` (TEXT, Nullable)
   - `status` (TEXT: `Available`, `Reserved`, `Sold`)
   - `featured` (BOOLEAN: Flag for homepage display)
   - `amenities` (JSONB: Array of strings e.g. `["Water Supply", "Gated Community"]`)
   - `images` (JSONB: Legacy array of image URLs)
   - `created_at` / `updated_at` (TIMESTAMPTZ)

2. **`public.property_images`**
   - `id` (UUID, Primary Key)
   - `property_id` (UUID, Foreign Key to `properties.id` ON DELETE CASCADE)
   - `image_url` (TEXT: Cloudinary CDN HTTPS URL)
   - `public_id` (TEXT: Cloudinary asset ID for automated deletion)
   - `display_order` (INTEGER: Sort order of images in gallery)
   - `created_at` (TIMESTAMPTZ)

3. **`public.enquiries`**
   - `id` (UUID, Primary Key)
   - `property_id` (UUID, Nullable Foreign Key to `properties.id` ON DELETE SET NULL)
   - `name` (TEXT, Required)
   - `phone` (TEXT, Required)
   - `email` (TEXT, Nullable)
   - `message` (TEXT, Required)
   - `status` (TEXT: `New`, `Contacted`, `Interested`, `Closed` — default `New`)
   - `notification_status` (TEXT: `pending`, `sending`, `sent` — default `pending`)
   - `notification_claimed_at` (TIMESTAMPTZ, Nullable)
   - `notification_sent_at` (TIMESTAMPTZ, Nullable)
   - `created_at` / `updated_at` (TIMESTAMPTZ)

4. **`public.business_settings`**
   - `id` (TEXT, Primary Key, fixed row `'default'`)
   - `name` (TEXT: Brand name e.g. "Fauji Properties")
   - `phone` (TEXT: Phone number)
   - `whatsapp` (TEXT: WhatsApp number with country code)
   - `email` (TEXT: Contact email)
   - `address` (TEXT: Physical office address)
   - `maps_url` (TEXT: Google Maps location URL)
   - `description` (TEXT: Tagline / mission statement)
   - `notification_enabled` (BOOLEAN: Toggle for email notifications)
   - `created_at` / `updated_at` (TIMESTAMPTZ)

### 4.2 Security & RLS Policy Matrix

By design (enacted in migration `0007_restrict_admin_data_policies.sql`), the public anonymous client key has minimal permissions:
- **`properties`**: Public `SELECT` allowed for all users. Direct `INSERT`, `UPDATE`, `DELETE` via client anon key are revoked.
- **`property_images`**: Public `SELECT` allowed for all users.
- **`enquiries`**: Public `INSERT` allowed (so visitors can submit forms). Direct `SELECT`, `UPDATE`, `DELETE` via client anon key are revoked.
- **`business_settings`**: Public `SELECT` allowed. Updates restricted to service-role / authenticated admin.

> **Crucial Security Pattern**: All administrative operations (property modifications, image deletion, enquiry status updates, settings updates) are executed via **Next.js Server Actions** or protected **Route Handlers**. The server action first verifies the user's admin identity against `ADMIN_EMAIL` or `app_metadata.role === 'admin'`. Only after verification does it initialize `createAuthorizedAdminClient()`, which uses the server-only `SUPABASE_SERVICE_ROLE_KEY`.

### 4.3 Stored Procedures / RPC

- **`claim_enquiry_notification(p_enquiry_id UUID) -> BOOLEAN`**:
  - Atomic PL/pgSQL function with `SECURITY DEFINER`.
  - Claims an enquiry for email dispatch by setting `notification_status = 'sending'` and `notification_claimed_at = now()`.
  - Prevents race conditions and double-dispatching by returning `false` if already claimed within the last 10 minutes or already sent.

---

## 5. End-to-End Application Flows

### Flow 1: Public Visitor Property Discovery & Filtering
```text
[Visitor Browser]
       │
       ▼
   app/properties/page.tsx (Server Component fetches all properties)
       │
       ▼
   components/PropertyListings.tsx (Client Component)
       ├── Reads URL SearchParams (?location, ?type, ?status, ?budget, ?minPrice, etc.)
       ├── Real-time filtering by:
       │     • Keyword search (Title, City, Location)
       │     • Property Type (Villa, Apartment, House, Plot, Commercial, Land)
       │     • Status (Available, Reserved, Sold)
       │     • Budget brackets or numeric price range (Min/Max Lakhs)
       │     • Area range (Min/Max sq.ft.)
       │     • Minimum bedroom count
       └── Renders responsive PropertyGrid with live result counter
```

### Flow 2: Property Detail & Lead Conversion
```text
[Visitor clicks Property Card]
       │
       ▼
   app/properties/[id]/page.tsx (Fetches by slug via getPropertyBySlug)
       ├── Injects Dynamic OpenGraph & Meta tags (title, price, image)
       └── Renders PropertyDetail.tsx
             ├── PropertyGallery (Interactive image view)
             ├── Specs & Amenities grid (Facing, Area, Parking, Bedrooms)
             ├── WhatsApp Quick-Action CTA:
             │     Encodes property title, price, location, and canonical URL into a pre-filled WhatsApp chat link
             ├── Direct Phone Call link
             ├── SavePropertyButton (Persists to localStorage)
             ├── CompareButton (Adds to comparison bar)
             ├── EnquiryForm (Embedded lead capture)
             └── Similar Properties Grid (Automated query matching city or property type)
```

### Flow 3: Property Comparison Flow
```text
[Visitor clicks "Compare" on up to 3 properties]
       │
       ▼
   ComparisonProvider (React Context in RootLayout)
       ├── Persists selected IDs to localStorage ('fauji-property-comparison')
       ├── Syncs state across browser tabs
       └── Fetches full property objects via /api/properties?ids=id1,id2,id3
             │
             ▼
   app/compare/page.tsx -> ComparisonPage.tsx
       ├── Side-by-side specification table
       ├── Automated diff highlighting (highlights row if values differ)
       ├── Direct links to property or embedded inquiry form
       └── Individual removal and "Clear all" actions
```

### Flow 4: Saved / Favorite Properties Flow
- Handled completely client-side in `components/SavePropertyButton.tsx`.
- Uses `localStorage` key `'fauji-properties:saved'`.
- Reactivity across un-nested components is achieved using `useSyncExternalStore` listening to the custom window event `'saved-properties-change'`. No heavy external state management library required.

### Flow 5: Lead Submission & Atomic Notification Flow
```text
[Visitor fills EnquiryForm]
       │
       ▼
   createEnquiryAction(formData) (Server Action in lib/enquiries/actions.ts)
       ├── Validates name, phone, email, and message
       ├── Inserts record into public.enquiries with status='New', notification_status='pending'
       ├── Triggers notifyNewEnquiry(enquiryId) (lib/enquiries/notifications.ts)
       │     ├── Calls Supabase RPC: claim_enquiry_notification(enquiryId)
       │     ├── If claimed: Fetches enquiry & property details
       │     ├── Compiles branded HTML email template
       │     ├── Sends email via Resend API (to ADMIN_EMAIL or settings.email)
       │     └── Updates enquiry notification_status='sent' (or resets on failure)
       └── Calls revalidatePath("/admin/enquiries")
```

### Flow 6: Admin Authentication, Route Guard & Session Management
```text
[Admin visits /admin or /admin/*]
       │
       ▼
   middleware.ts -> updateSupabaseSession(request) (lib/supabase/proxy.ts)
       ├── Validates Supabase JWT session cookie
       ├── Verifies if user.email === ADMIN_EMAIL or user.app_metadata.role === 'admin'
       ├── If unauthenticated/unauthorized: Redirects to /admin/login?next=/admin/...
       └── If already authenticated on /admin/login: Redirects to /admin
       │
[Admin Login Execution]
   components/admin/AdminLoginForm.tsx -> POST /api/admin/login
       ├── Checks credentials against Supabase Auth
       ├── Inspects Remember Me checkbox:
       │     • Remember Me = false -> Session-only cookie (cleared when browser closes)
       │     • Remember Me = true  -> Persistent cookie (30-day maxAge)
       │     • Sets cookie 'admin-session-mode'
       └── AdminSidebar Inactivity Watcher:
             • Tracks user activity events (mousemove, keydown, click, scroll)
             • If idle for timeout (default 15 mins or NEXT_PUBLIC_ADMIN_INACTIVITY_TIMEOUT_MINUTES):
               Automatically posts to /api/admin/logout and redirects to login.
```

### Flow 7: Admin Property CRUD & Cloudinary Direct Upload Flow
```text
[Admin creates or edits a property in AdminPropertyForm.tsx]
       │
   1. Media Selection: Admin selects multiple image files (JPG, PNG, WebP <= 10MB)
   2. Direct Cloudinary Upload:
       • Client makes direct POST request to:
         https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
       • Uses upload preset with folder 'property-website/properties'
       • Receives { secure_url, public_id } for each image
   3. Server Action Execution:
       • createPropertyAction or updatePropertyAction receives FormData + uploaded images JSON
       • Generates clean URL slug from title
       • Saves property to properties table
       • Inserts image rows into property_images table with display_order
       • Calls revalidatePath("/properties"), revalidatePath("/"), revalidatePath("/admin/properties")
       │
[Admin deletes a property or individual image]
       • Server Action deletes rows from properties & property_images in Supabase
       • Triggers deleteCloudinaryImage(public_id) via Cloudinary API SDK to remove files from cloud storage
```

### Flow 8: Admin Enquiry Lifecycle
- Admin accesses `/admin/enquiries`.
- Server component fetches all enquiries joined with property titles.
- Interactive table (`AdminEnquiriesClient.tsx`) allows:
  - Filtering by status: `New`, `Contacted`, `Interested`, `Closed`.
  - Instant status update via Server Action `updateEnquiryStatusAction`.
  - Direct WhatsApp click to chat with the lead.
  - Deletion of spam inquiries via `deleteEnquiryAction`.

### Flow 9: Business & Security Settings Flow
- Admin accesses `/admin/settings`.
- **General Tab**: Modifies company name, phone, WhatsApp number, email, address, Google Maps link, and notification toggles. Saved to `business_settings` (ID: `'default'`) and revalidates public pages.
- **Security Tab**: Changes admin password or email address directly through Supabase Auth Admin API (`supabase.auth.updateUser`).

---

## 6. Environment Variables Reference

| Variable Name | Environment | Required | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | **Yes** | HTTPS URL of the Supabase project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | **Yes** | Public Supabase anonymous API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | **Yes** | Privileged Supabase service role key (Never exposed to client). |
| `ADMIN_EMAIL` | Server-Only | **Yes** | Email address authorized for admin dashboard access. |
| `NEXT_PUBLIC_ADMIN_INACTIVITY_TIMEOUT_MINUTES` | Client | No | Minutes of inactivity before auto-logout (default: 5 to 15). |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Client & Server | No | Default phone number displayed across the site. |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Client & Server | No | Default WhatsApp number (with country code, digits only). |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client & Server | **Yes** | Cloudinary cloud identifier for uploads and CDN URLs. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Client | **Yes** | Unsigned upload preset for direct browser image uploads. |
| `CLOUDINARY_API_KEY` | Server-Only | **Yes** | Cloudinary API Key for server-side image deletion. |
| `CLOUDINARY_API_SECRET` | Server-Only | **Yes** | Cloudinary API Secret for server-side image deletion. |
| `RESEND_API_KEY` | Server-Only | **Yes** | API key from Resend for sending notification emails. |
| `RESEND_FROM_EMAIL` | Server-Only | **Yes** | Verified sender email, e.g. `Fauji Properties <enquiries@faujiproperties.in>`. |
| `RESEND_NOTIFICATION_EMAIL` | Server-Only | **Yes** | Inbox which receives each new enquiry notification. Overrides the public business contact email. |
| `SITE_URL` | Server-Only | **Yes** | Canonical site URL (e.g. `https://faujiproperties.com` or `http://localhost:3000`). |

---

## 7. Developer Scripts & Common Workflows

```bash
# Run local development server (accessible over local network via 0.0.0.0)
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start

# Run ESLint linter
npm run lint

# Assign 'admin' role metadata to ADMIN_EMAIL in Supabase
npm run assign-admin-role
```

---

## 8. Summary for AI Assistants & New IDE Instances

When switching IDEs or opening a new chat context:
- You do **not** need to re-crawl or re-analyze the workspace.
- Refer to this file (`PROJECT_OVERVIEW.md`) for architectural decisions, technology versions, database schemas, and integration contracts.
- Respect the security boundary: Client components never touch `SUPABASE_SERVICE_ROLE_KEY` or `CLOUDINARY_API_SECRET`. All mutations occur through Server Actions in `lib/*/actions.ts`.
- Tailwind CSS is version 4; style overrides and color tokens are managed via CSS variables in `app/globals.css`.
