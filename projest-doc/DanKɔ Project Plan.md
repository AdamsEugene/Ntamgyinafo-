# Ntamgyinafoɔ – Complete Project Plan

## Executive Summary

**Ntamgyinafoɔ** (meaning "Go to the house" in Twi) is a mobile property marketplace designed specifically for the Ghanaian market. The platform connects property owners with buyers and tenants through an innovative visual-first approach featuring GPS mapping, video tours, and 360° property views.

**Tagline:** *Find. Visit. Own.*

---

## Table of Contents

1. [Problem & Solution](#1-problem--solution)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Subscription & Revenue Model](#3-subscription--revenue-model)
4. [Core Features](#4-core-features)
5. [Technical Architecture](#5-technical-architecture)
6. [Database Schema](#6-database-schema)
7. [App Screens & User Flow](#7-app-screens--user-flow)
8. [Development Phases](#8-development-phases)
9. [Budget Estimation](#9-budget-estimation)
10. [Launch Strategy](#10-launch-strategy)

---

## 1. Problem & Solution

### The Problem

Finding property in Ghana today is frustrating:

- Buyers waste time visiting properties that don't match descriptions
- Owners struggle to reach serious, qualified buyers
- Agents sometimes list fake or already-sold properties
- No reliable way to see a property remotely before committing to a visit
- Location descriptions are vague ("near the junction," "behind the market")
- Trust issues between strangers in property transactions

### Our Solution

Ntamgyinafoɔ creates a trusted, visual marketplace where:

- Every property comes with real photos, videos, and 360° tours
- GPS coordinates show exact locations on a map
- Subscription model filters out casual browsers and fake listings
- Verified badges build trust between parties
- Direct communication happens within the app

---

## 2. User Roles & Permissions

### 2.1 Administrator

**Purpose:** Platform governance, quality control, and revenue management

#### Capabilities

| Function | Description |
|----------|-------------|
| User Management | Review and approve new registrations, suspend/ban violators |
| Property Moderation | Approve listings before they go live, remove fraudulent content |
| Subscription Management | Create/edit plans, manage pricing tiers |
| Payment Oversight | Process refunds, handle disputes, track revenue |
| Analytics Access | View dashboards for user growth, revenue, popular areas |
| Communications | Send platform announcements and notifications |

#### Admin Dashboard Sections

- Overview (key metrics)
- Pending Approvals (users and properties)
- Active Listings
- Subscription Analytics
- Payment Reports
- User Reports & Complaints
- System Settings

---

### 2.2 Property Owner / Landlord

**Purpose:** List properties for sale or rent

#### Registration Requirements

| Requirement | Mandatory | Notes |
|-------------|-----------|-------|
| Phone Number | Yes | Verified via OTP |
| Full Name | Yes | As appears on ID |
| Ghana Card / Voter ID | Yes | For identity verification |
| Profile Photo | No | Increases trust |
| Proof of Ownership | No | Earns verified badge |

#### Capabilities

**Property Listing:**
- Create listings with comprehensive details
- Property type: House, Apartment, Land, Commercial, Hostel
- Transaction type: For Sale, For Rent
- Pricing: Fixed or Negotiable
- Specifications: Bedrooms, bathrooms, plot size
- Amenities: Water, electricity, security, parking, etc.

**Media Upload:**
- Up to 15 high-quality photos
- Up to 3 videos (max 2 minutes each)
- One 360° panoramic view

**Location Services:**
- Auto-capture GPS coordinates
- Manual pin adjustment on map
- Auto-generated address from coordinates

**Communication:**
- Receive inquiry notifications
- In-app messaging with buyers
- In-app voice calls
- View buyer profiles before responding

**Listing Management:**
- Preview listing before publishing
- Edit listing details anytime
- Mark as: Available, Under Negotiation, Sold, Rented
- View performance stats (views, saves, inquiries)
- Renew or delete listings

#### Subscription Limits

- Each subscription: **2 property listings maximum**
- Must renew to list additional properties
- Listings remain active for subscription duration

---

### 2.3 Buyer / Tenant

**Purpose:** Search for and connect with property owners

#### Registration Requirements

| Requirement | Mandatory | Notes |
|-------------|-----------|-------|
| Phone Number | Yes | Verified via OTP |
| Full Name | Yes | Display name |
| Preferred Locations | No | Improves recommendations |
| Budget Range | No | Improves recommendations |

#### Capabilities

**Browsing (Free):**
- View all verified property listings
- See property photos (limited to 3)
- View basic details (type, price, location area)
- Save properties to wishlist

**Full Access (Subscribed):**
- View all photos, videos, 360° tours
- See exact GPS location on map
- Get directions to property
- Contact owner (call/message)
- View owner profile and ratings

**Search & Filter Options:**
- Region, City, Neighborhood
- Property type
- Transaction type (buy/rent)
- Price range (min-max)
- Number of bedrooms
- Specific amenities
- Distance from current location

**Map Features:**
- Interactive property map
- Cluster view for dense areas
- Tap pins for quick preview
- Satellite/terrain view toggle
- Nearby amenities layer (schools, hospitals, markets)

#### Subscription Limits

- Each subscription: **2 property contacts maximum**
- Unlimited browsing always available
- Must renew to contact additional owners

---

## 3. Subscription & Revenue Model

### 3.1 Subscription Plans

#### For Property Owners

| Plan | Price (GHS) | Duration | Listings | Features |
|------|-------------|----------|----------|----------|
| Basic | 50 | 30 days | 2 | Standard listing placement |
| Standard | 80 | 60 days | 2 | Standard + analytics |
| Premium | 120 | 90 days | 2 | Priority support + analytics |

#### For Buyers/Tenants

| Plan | Price (GHS) | Duration | Contacts | Features |
|------|-------------|----------|----------|----------|
| Basic | 30 | 30 days | 2 | Full property access |
| Standard | 50 | 60 days | 2 | Full access + saved searches |
| Premium | 70 | 90 days | 2 | Full access + early notifications |

### 3.2 Additional Revenue Streams

| Revenue Source | Price (GHS) | Description |
|----------------|-------------|-------------|
| Featured Listing | 20-50 | Top placement for 7 days |
| Verified Badge | 30 | Identity + ownership verification |
| Agent Package | 200 | 10 listings for 90 days |
| Developer Package | 500 | 30 listings for 90 days |
| Banner Ads | Negotiable | For related services (movers, furniture) |

### 3.3 Payment Methods

- Mobile Money (MTN, Vodafone, AirtelTigo)
- Bank Cards (Visa, Mastercard)
- Bank Transfer

**Payment Gateway Options:**
- Paystack (recommended for Ghana)
- Hubtel
- ExpressPay

---

## 4. Core Features

### 4.1 Property Listing System

#### Listing Creation Flow

```
Start → Select Type → Add Details → Upload Media → Set Location → Preview → Pay → Submit for Review → Live
```

#### Mandatory Fields

| Field | Type | Validation |
|-------|------|------------|
| Property Type | Dropdown | Required |
| Transaction Type | Dropdown | Required |
| Price | Number | Min: 1 |
| Currency | Dropdown | GHS default |
| Photos | Image | Min: 5, Max: 15 |
| Location | GPS | Required |
| Description | Text | Min: 100 characters |

#### Optional Fields

| Field | Type | Notes |
|-------|------|-------|
| Video Tour | Video | Max 3, 2 min each |
| 360° View | Image | Panorama format |
| Bedrooms | Number | For houses |
| Bathrooms | Number | For houses |
| Plot Size | Number | In plots or acres |
| Amenities | Multi-select | Checkbox list |
| Year Built | Number | For houses |
| Furnishing | Dropdown | Furnished/Unfurnished |

### 4.2 GPS & Mapping System

#### Owner Location Capture

1. App requests location permission
2. GPS coordinates captured automatically
3. Address auto-generated via reverse geocoding
4. Owner can drag pin to adjust
5. Final coordinates saved with listing

#### Buyer Map Experience

| Feature | Description |
|---------|-------------|
| Map View | See all properties as pins |
| Clustering | Group nearby properties |
| Quick Preview | Tap pin for popup card |
| Filters | Apply same filters as list view |
| Directions | Open in Google Maps or in-app |
| Satellite View | Toggle for area assessment |
| Nearby Places | Schools, hospitals, markets overlay |

### 4.3 Media System

#### Photo Requirements

| Specification | Value |
|---------------|-------|
| Minimum Resolution | 1280 x 720 pixels |
| Maximum File Size | 5 MB per image |
| Supported Formats | JPEG, PNG |
| Minimum Count | 5 |
| Maximum Count | 15 |

#### Video Requirements

| Specification | Value |
|---------------|-------|
| Maximum Length | 2 minutes |
| Maximum File Size | 100 MB |
| Supported Format | MP4 |
| Maximum Count | 3 |

#### 360° View Requirements

| Specification | Value |
|---------------|-------|
| Type | Equirectangular panorama |
| Minimum Resolution | 4096 x 2048 pixels |
| Maximum File Size | 15 MB |
| Count | 1 per listing |

### 4.4 Communication System

#### In-App Messaging

- Real-time text chat
- Read receipts
- Image sharing within chat
- Chat history preservation
- Block/report functionality

#### In-App Calling

- VoIP calls through app
- Phone numbers hidden initially
- Call duration tracking
- Missed call notifications
- Option to reveal number after trust established

#### Notifications

| Event | Owner | Buyer |
|-------|-------|-------|
| New Inquiry | ✓ | - |
| Message Received | ✓ | ✓ |
| Listing Approved | ✓ | - |
| Subscription Expiring | ✓ | ✓ |
| New Matching Property | - | ✓ |
| Price Drop on Saved | - | ✓ |

### 4.5 Search & Discovery

#### Search Algorithm Factors

1. Relevance to search query
2. Listing completeness score
3. Media quality (photos, video, 360°)
4. Owner response rate
5. Recency of listing
6. Featured status (paid boost)

#### Discovery Features

- **Trending:** Most viewed this week
- **New Listings:** Added in last 7 days
- **Near You:** Based on GPS
- **Price Drops:** Recently reduced
- **Verified Only:** Trusted sellers filter

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### Mobile App (Frontend)

| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | Flutter | Cross-platform (Android + iOS) |
| State Management | Riverpod or BLoC | Scalable, testable |
| Maps | Google Maps SDK | Best coverage in Ghana |
| 360° Viewer | panorama_viewer package | Native feel |
| Video Player | video_player package | Reliable |
| Local Storage | Hive | Fast, lightweight |

#### Backend

| Component | Technology | Reason |
|-----------|------------|--------|
| Runtime | Node.js with Express | Fast, scalable |
| Database | PostgreSQL | Relational, reliable |
| Cache | Redis | Session, frequently accessed data |
| File Storage | AWS S3 or Cloudinary | Media files |
| Search | Elasticsearch | Fast property search |
| Real-time | Socket.io | Chat, notifications |

#### Third-Party Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Payment | Paystack | Mobile money + cards |
| SMS/OTP | Hubtel or Arkesel | Phone verification |
| Maps | Google Maps Platform | Geocoding, directions |
| Push Notifications | Firebase Cloud Messaging | Alerts |
| Analytics | Mixpanel or Amplitude | User behavior |
| Crash Reporting | Sentry | Error tracking |

### 5.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTS                                 │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Android App    │    iOS App      │    Admin Web Dashboard  │
│  (Flutter)      │    (Flutter)    │    (React)              │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                      │
         └─────────────────┼──────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API       │
                    │   Gateway   │
                    │  (Nginx)    │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐     ┌────▼────┐
    │  Auth   │      │  Main     │     │  Chat   │
    │ Service │      │  API      │     │ Service │
    └────┬────┘      └─────┬─────┘     └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼────┐  ┌────▼────┐  ┌───▼───┐
         │PostgreSQL│  │  Redis  │  │  S3   │
         │(Database)│  │ (Cache) │  │(Media)│
         └─────────┘  └─────────┘  └───────┘
```

### 5.3 API Endpoints Overview

#### Authentication

```
POST   /api/auth/register
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
```

#### Users

```
GET    /api/users/me
PUT    /api/users/me
PUT    /api/users/me/photo
GET    /api/users/:id (public profile)
```

#### Properties

```
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id
PUT    /api/properties/:id/status
GET    /api/properties/:id/stats
POST   /api/properties/:id/media
DELETE /api/properties/:id/media/:mediaId
```

#### Search

```
GET    /api/search?query=...&filters=...
GET    /api/search/map?bounds=...
GET    /api/search/nearby?lat=...&lng=...
```

#### Subscriptions

```
GET    /api/subscriptions/plans
POST   /api/subscriptions/purchase
GET    /api/subscriptions/my
POST   /api/subscriptions/renew
```

#### Chat

```
GET    /api/chats
GET    /api/chats/:id/messages
POST   /api/chats/:propertyId/start
POST   /api/chats/:id/messages
```

#### Admin

```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/status
GET    /api/admin/properties/pending
PUT    /api/admin/properties/:id/approve
PUT    /api/admin/properties/:id/reject
GET    /api/admin/subscriptions
GET    /api/admin/payments
```

---

## 6. Database Schema

### 6.1 Core Tables

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_photo_url VARCHAR(500),
    role ENUM('buyer', 'owner', 'admin') NOT NULL,
    id_type VARCHAR(50),
    id_number VARCHAR(50),
    id_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### properties

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    property_type ENUM('house', 'apartment', 'land', 'commercial', 'hostel') NOT NULL,
    transaction_type ENUM('sale', 'rent') NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GHS',
    is_negotiable BOOLEAN DEFAULT TRUE,
    bedrooms INTEGER,
    bathrooms INTEGER,
    plot_size DECIMAL(10, 2),
    plot_unit VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status ENUM('pending', 'active', 'under_negotiation', 'sold', 'rented', 'rejected') DEFAULT 'pending',
    views_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### property_media

```sql
CREATE TABLE property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    media_type ENUM('image', 'video', 'panorama') NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### property_amenities

```sql
CREATE TABLE property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id),
    PRIMARY KEY (property_id, amenity_id)
);
```

#### amenities

```sql
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    category VARCHAR(50)
);
```

#### subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    plan_id UUID REFERENCES subscription_plans(id),
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    properties_used INTEGER DEFAULT 0,
    contacts_used INTEGER DEFAULT 0,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### subscription_plans

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    user_type ENUM('owner', 'buyer') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    max_properties INTEGER,
    max_contacts INTEGER,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### payments

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GHS',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    provider_reference VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### chats

```sql
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    owner_id UUID REFERENCES users(id),
    buyer_id UUID REFERENCES users(id),
    last_message_at TIMESTAMP,
    owner_unread_count INTEGER DEFAULT 0,
    buyer_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### messages

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'system') DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### saved_properties

```sql
CREATE TABLE saved_properties (
    user_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
);
```

---

## 7. App Screens & User Flow

### 7.1 Screen List

#### Onboarding & Auth

| Screen | Description |
|--------|-------------|
| Splash | Logo animation, auto-login check |
| Onboarding | 3-4 slides explaining app value |
| Login | Phone + password |
| Register | Phone, name, password, role selection |
| OTP Verification | 6-digit code entry |
| Forgot Password | Phone entry for reset |

#### Buyer Screens

| Screen | Description |
|--------|-------------|
| Home | Search bar, categories, featured, nearby |
| Search Results | List view with filters |
| Map View | Properties on interactive map |
| Property Details | Full info, media gallery, contact button |
| 360° Viewer | Immersive panorama view |
| Video Player | Full-screen video |
| Owner Profile | Public info, other listings, rating |
| Saved Properties | Wishlist |
| Chat List | All conversations |
| Chat Detail | Messages with owner |
| My Subscription | Plan details, usage, renew |
| Settings | Profile, notifications, help |

#### Owner Screens

| Screen | Description |
|--------|-------------|
| Dashboard | Stats, active listings, recent inquiries |
| My Listings | All properties with status |
| Create Listing | Multi-step form |
| Edit Listing | Modify existing |
| Listing Stats | Views, saves, inquiries graph |
| Inquiries | List of interested buyers |
| Chat List | Conversations with buyers |
| Chat Detail | Messages with buyer |
| My Subscription | Plan, usage, renew |
| Settings | Profile, notifications, help |

#### Admin Screens (Web)

| Screen | Description |
|--------|-------------|
| Dashboard | Key metrics, charts |
| User Management | List, search, actions |
| Property Moderation | Pending approvals |
| Subscriptions | Plans management |
| Payments | Transaction history |
| Reports | Analytics, exports |
| Settings | System configuration |

### 7.2 User Flows

#### Buyer Journey

```
Download App
    ↓
Onboarding Slides
    ↓
Register (Phone + OTP)
    ↓
Browse Properties (Free)
    ↓
Find Interesting Property
    ↓
View Limited Details
    ↓
Want Full Access?
    ↓
Subscribe (Pay via MoMo)
    ↓
View Full Details + 360° + Video
    ↓
Contact Owner
    ↓
Chat / Call
    ↓
Visit Property (Use Map Directions)
    ↓
Negotiate Offline
    ↓
Complete Transaction
```

#### Owner Journey

```
Download App
    ↓
Onboarding Slides
    ↓
Register as Owner (Phone + ID)
    ↓
Subscribe to List
    ↓
Create Listing
    ↓
Add Photos, Video, 360°
    ↓
Set Location (GPS)
    ↓
Submit for Review
    ↓
Admin Approves
    ↓
Listing Goes Live
    ↓
Receive Inquiries
    ↓
Chat with Buyers
    ↓
Schedule Visits
    ↓
Negotiate
    ↓
Mark as Sold/Rented
```

---

## 8. Development Phases

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Core infrastructure and authentication

| Task | Duration | Deliverable |
|------|----------|-------------|
| Project setup | 3 days | Flutter + Node.js boilerplate |
| Database design | 2 days | PostgreSQL schema |
| Auth system | 5 days | Register, login, OTP |
| User profiles | 3 days | Profile CRUD |
| Admin panel setup | 4 days | React dashboard base |
| CI/CD pipeline | 2 days | Automated builds |

**Milestone:** Users can register and login

---

### Phase 2: Property Core (Weeks 5-8)

**Goal:** Property listing and viewing

| Task | Duration | Deliverable |
|------|----------|-------------|
| Property CRUD API | 5 days | Full endpoint suite |
| Image upload | 3 days | S3 integration |
| Video upload | 3 days | Compression + storage |
| 360° upload | 2 days | Panorama handling |
| Property list screen | 4 days | Buyer app view |
| Property detail screen | 4 days | Full media gallery |
| Create listing flow | 5 days | Owner app screens |

**Milestone:** Owners can list, buyers can browse

---

### Phase 3: Location Features (Weeks 9-11)

**Goal:** GPS and mapping functionality

| Task | Duration | Deliverable |
|------|----------|-------------|
| Google Maps integration | 3 days | SDK setup |
| Location capture | 3 days | GPS + manual adjust |
| Map view screen | 4 days | Property pins |
| Search by location | 3 days | Radius search |
| Directions feature | 2 days | Navigation launch |
| Nearby places layer | 3 days | POI overlay |

**Milestone:** Full location-based discovery

---

### Phase 4: Payments & Subscriptions (Weeks 12-14)

**Goal:** Monetization system

| Task | Duration | Deliverable |
|------|----------|-------------|
| Paystack integration | 4 days | MoMo + cards |
| Subscription plans API | 3 days | CRUD + limits |
| Purchase flow | 4 days | Plan selection + payment |
| Usage tracking | 3 days | Limit enforcement |
| Payment history | 2 days | Transaction records |
| Admin payment view | 2 days | Dashboard section |

**Milestone:** Revenue generation active

---

### Phase 5: Communication (Weeks 15-17)

**Goal:** In-app messaging and notifications

| Task | Duration | Deliverable |
|------|----------|-------------|
| Chat backend | 4 days | Socket.io + storage |
| Chat UI | 4 days | Message screens |
| Push notifications | 3 days | FCM integration |
| In-app notifications | 2 days | Notification center |
| Email notifications | 2 days | Transactional emails |
| VoIP calling | 4 days | Audio calls |

**Milestone:** Full communication suite

---

### Phase 6: Search & Discovery (Weeks 18-19)

**Goal:** Advanced search capabilities

| Task | Duration | Deliverable |
|------|----------|-------------|
| Elasticsearch setup | 2 days | Index configuration |
| Advanced filters | 3 days | Multi-criteria search |
| Search suggestions | 2 days | Autocomplete |
| Saved searches | 2 days | Alert on match |
| Trending/featured | 2 days | Discovery sections |

**Milestone:** Powerful property discovery

---

### Phase 7: Admin & Moderation (Weeks 20-21)

**Goal:** Complete admin functionality

| Task | Duration | Deliverable |
|------|----------|-------------|
| User moderation | 3 days | Suspend, verify |
| Property approval | 3 days | Review queue |
| Analytics dashboard | 4 days | Charts, metrics |
| Report generation | 2 days | Export features |
| System settings | 2 days | Config management |

**Milestone:** Full platform control

---

### Phase 8: Polish & Launch (Weeks 22-24)

**Goal:** Production readiness

| Task | Duration | Deliverable |
|------|----------|-------------|
| Bug fixes | 5 days | Issue resolution |
| Performance optimization | 3 days | Speed improvements |
| Security audit | 3 days | Vulnerability fixes |
| App store preparation | 3 days | Screenshots, descriptions |
| Beta testing | 5 days | User feedback |
| Launch | 1 day | Go live! |

**Milestone:** 🚀 Public launch

---

## 9. Budget Estimation

### 9.1 Development Costs

| Item | Estimated Cost (GHS) | Notes |
|------|----------------------|-------|
| Mobile Developer | 60,000 - 80,000 | 6 months, Flutter |
| Backend Developer | 50,000 - 70,000 | 6 months, Node.js |
| UI/UX Designer | 15,000 - 25,000 | App + admin design |
| QA Tester | 15,000 - 20,000 | 3 months |
| Project Manager | 20,000 - 30,000 | 6 months, part-time |
| **Subtotal** | **160,000 - 225,000** | |

### 9.2 Infrastructure Costs (Monthly)

| Service | Estimated Cost (GHS) | Notes |
|---------|----------------------|-------|
| Cloud Hosting (AWS/DO) | 800 - 1,500 | Servers, database |
| Media Storage (S3) | 200 - 500 | Images, videos |
| Google Maps API | 300 - 600 | Depends on usage |
| SMS/OTP Service | 200 - 400 | Per verification |
| Push Notifications | Free - 200 | Firebase tier |
| Domain + SSL | 50 - 100 | Annual |
| **Monthly Total** | **1,550 - 3,300** | |

### 9.3 Third-Party Services (Monthly)

| Service | Cost (GHS) | Notes |
|---------|------------|-------|
| Paystack | 1.95% per transaction | No monthly fee |
| Analytics (Mixpanel) | Free - 500 | Depends on events |
| Error Tracking (Sentry) | Free - 200 | Depends on volume |
| Email Service | Free - 100 | Transactional emails |

### 9.4 Marketing Budget (Launch)

| Item | Estimated Cost (GHS) |
|------|----------------------|
| Social Media Ads | 5,000 - 10,000 |
| Influencer Partnerships | 3,000 - 8,000 |
| PR & Press | 2,000 - 5,000 |
| Launch Event | 3,000 - 7,000 |
| **Total** | **13,000 - 30,000** |

### 9.5 Total Budget Summary

| Category | Low Estimate (GHS) | High Estimate (GHS) |
|----------|--------------------|--------------------|
| Development | 160,000 | 225,000 |
| Infrastructure (6 mo) | 9,300 | 19,800 |
| Marketing (Launch) | 13,000 | 30,000 |
| Contingency (15%) | 27,345 | 41,220 |
| **Grand Total** | **209,645** | **316,020** |

---

## 10. Launch Strategy

### 10.1 Pre-Launch (4 weeks before)

**Week -4:**
- Finalize app store listings (screenshots, descriptions)
- Set up social media accounts (@DanKoApp)
- Create landing page with email signup
- Begin teaser campaign

**Week -3:**
- Launch beta testing with 50-100 users
- Collect feedback, fix critical issues
- Create tutorial videos
- Begin influencer outreach

**Week -2:**
- Press release preparation
- Final bug fixes from beta
- Prepare customer support resources
- Set up analytics tracking

**Week -1:**
- Submit to app stores
- Prepare launch day content
- Brief all team members
- Test payment systems thoroughly

### 10.2 Launch Day

- App goes live on Play Store and App Store
- Social media announcement
- Email to beta users and waitlist
- Press release distribution
- Monitor for issues 24/7

### 10.3 Post-Launch (First 30 days)

**Week 1:**
- Monitor app store reviews, respond quickly
- Fix any critical bugs immediately
- Daily check on key metrics
- Engage with early users

**Week 2-4:**
- Analyze user behavior data
- Gather feature requests
- Plan first update based on feedback
- Expand marketing reach
- Onboard first batch of property owners

### 10.4 Growth Targets

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| Downloads | 1,000 | 5,000 | 15,000 | 50,000 |
| Registered Users | 500 | 3,000 | 10,000 | 35,000 |
| Active Listings | 50 | 300 | 1,000 | 5,000 |
| Paid Subscribers | 30 | 200 | 800 | 3,000 |
| Monthly Revenue (GHS) | 2,000 | 15,000 | 60,000 | 200,000 |

### 10.5 Key Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| User Acquisition Cost | < GHS 5 | Ad spend / new users |
| Conversion to Paid | > 10% | Subscribers / registered |
| Listing Completion Rate | > 70% | Published / started |
| User Retention (Day 30) | > 25% | Active after 30 days |
| Average Response Time | < 2 hours | Owner reply to inquiry |
| App Store Rating | > 4.0 | Play Store + App Store |

---

## Appendix A: Competitor Analysis

| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| Meqasa | Established brand, large listings | No 360°, subscription-free attracts fake listings | Visual-first, quality control |
| Tonaton | Wide reach, general marketplace | Not property-focused, cluttered | Property-specific features |
| Jumia House | Known brand | Limited local focus | Ghana-specific, MoMo-first |
| Facebook Groups | Free, large audience | No verification, scams common | Trust, verification, UX |

---

## Appendix B: Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low initial adoption | Medium | High | Strong launch marketing, early adopter incentives |
| Fake listings | Medium | High | Verification system, admin moderation |
| Payment failures | Low | Medium | Multiple payment options, fallback methods |
| Technical issues at scale | Medium | Medium | Load testing, scalable architecture |
| Copycat competitors | Medium | Low | First-mover advantage, brand building |
| Regulatory changes | Low | Medium | Legal consultation, compliance monitoring |

---

## Appendix C: Future Features (v2.0+)

- **Virtual property tours** with live video calls
- **AI-powered price suggestions** based on market data
- **Mortgage calculator** integrated with local banks
- **Agent marketplace** for verified real estate agents
- **Document verification** for land titles
- **Neighborhood reviews** and safety ratings
- **AR view** to see property from street
- **Multi-language support** (Twi, Ga, Ewe, Hausa)

---

## Contact & Next Steps

**Ready to build Ntamgyinafoɔ?**

Next actions:
1. Finalize budget and timeline
2. Assemble development team
3. Create detailed UI/UX designs
4. Begin Phase 1 development

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Ntamgyinafoɔ – Find. Visit. Own.*