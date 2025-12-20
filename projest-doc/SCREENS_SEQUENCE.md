# Ntamgyinafoɔ - Complete Screen Sequence & Requirements

## Table of Contents
1. [App Entry & Onboarding](#1-app-entry--onboarding)
2. [Authentication Flow](#2-authentication-flow)
3. [Buyer Journey Screens](#3-buyer-journey-screens)
4. [Owner Journey Screens](#4-owner-journey-screens)
5. [Shared Screens](#5-shared-screens)
6. [Admin Panel Screens](#6-admin-panel-screens)

---

## 1. App Entry & Onboarding

### 1.1 Splash Screen
**Sequence:** First screen on app launch  
**Purpose:** Brand introduction and app initialization

**Required Elements:**
- Centered logo (120px)
- App name "Ntamgyinafoɔ" (Display Large, Bold)
- Tagline "Find. Visit. Own." (Body Large, Secondary color)
- Loading indicator at bottom
- Background: Primary Green gradient (#1B5E20 to #4CAF50)

**Functionality:**
- Check if first time user
- Check if user is logged in
- Auto-navigate after 2-3 seconds:
  - First time → Onboarding Slides
  - Logged in → Role-based dashboard
  - Not logged in → Welcome Screen

**Design Notes:**
- Full screen
- No navigation bar
- Smooth fade transition to next screen

---

### 1.2 Onboarding Slide 1: Find Properties
**Sequence:** Second screen (first-time users only)  
**Purpose:** Introduce property browsing feature

**Required Elements:**
- Illustration/Image (60% of screen height)
- Title: "Find Your Dream Property" (Headline Large)
- Description: "Browse thousands of verified properties across Ghana" (Body Medium)
- Page indicator: ● ○ ○ ○ (first dot active)
- "Get Started" button (Primary, bottom)
- Skip button (Text button, top right)

**Functionality:**
- Swipe left to next slide
- Tap "Get Started" → Welcome Screen
- Tap "Skip" → Welcome Screen

---

### 1.3 Onboarding Slide 2: Visual Tours
**Sequence:** Third screen (first-time users only)  
**Purpose:** Highlight visual media features

**Required Elements:**
- Illustration showing 360° view/Video (60% of screen)
- Title: "Visual Tours" (Headline Large)
- Description: "Experience properties with 360° views and video tours" (Body Medium)
- Page indicator: ○ ● ○ ○ (second dot active)
- "Next" button (Primary, bottom)
- Skip button (Text button, top right)

**Functionality:**
- Swipe left/right to navigate
- Tap "Next" → Slide 3

---

### 1.4 Onboarding Slide 3: Exact Locations
**Sequence:** Fourth screen (first-time users only)  
**Purpose:** Emphasize GPS mapping feature

**Required Elements:**
- Illustration showing map/GPS (60% of screen)
- Title: "Exact Locations" (Headline Large)
- Description: "See precise locations with GPS coordinates on interactive maps" (Body Medium)
- Page indicator: ○ ○ ● ○ (third dot active)
- "Next" button (Primary, bottom)
- Skip button (Text button, top right)

**Functionality:**
- Swipe left/right to navigate
- Tap "Next" → Slide 4

---

### 1.5 Onboarding Slide 4: Direct Contact
**Sequence:** Fifth screen (first-time users only)  
**Purpose:** Introduce communication features

**Required Elements:**
- Illustration showing chat/messaging (60% of screen)
- Title: "Direct Contact" (Headline Large)
- Description: "Chat directly with property owners and schedule visits" (Body Medium)
- Page indicator: ○ ○ ○ ● (fourth dot active)
- "Get Started" button (Primary, bottom)
- Skip button (Text button, top right)

**Functionality:**
- Swipe right to previous slide
- Tap "Get Started" → Welcome Screen
- Tap "Skip" → Welcome Screen

---

## 2. Authentication Flow

### 2.1 Welcome Screen
**Sequence:** After onboarding or app restart (not logged in)  
**Purpose:** Entry point for authentication

**Required Elements:**
- Centered logo (100px)
- App name "Ntamgyinafoɔ" (Display Medium)
- Tagline "The #1 Property App in Ghana" (Body Large, Secondary)
- "Login" button (Primary, full width, 48px height)
- "Create Account" button (Secondary, full width, 48px height)
- "Explore as Guest" link (Text button, centered)

**Functionality:**
- Tap "Login" → Login Screen
- Tap "Create Account" → Register Screen
- Tap "Explore as Guest" → Buyer Home (limited access)

**Design Notes:**
- Centered vertical layout
- Spacing: 32px between elements
- Background: Neutral background (#FAFAFA)

---

### 2.2 Login Screen
**Sequence:** From Welcome Screen  
**Purpose:** Authenticate existing users

**Required Elements:**
- Back button (←, top left)
- Title: "Welcome Back" (Headline Medium)
- Subtitle: "Sign in to continue" (Body Medium, Secondary)
- Phone Number input:
  - Label: "📱 Phone Number"
  - Placeholder: "+233 XX XXX XXXX"
  - Country code selector
  - Validation: Ghana phone format
- Password input:
  - Label: "🔒 Password"
  - Placeholder: "Enter password"
  - Show/Hide toggle (eye icon)
  - Minimum 6 characters
- "Forgot Password?" link (Text button, right aligned)
- "Sign In" button (Primary, full width)
- Footer text: "Don't have an account?"
- "Register" link (Text button, Primary Green)

**Functionality:**
- Validate phone format
- Validate password length
- Show error messages for invalid credentials
- Tap "Sign In" → Validate → Navigate to role-based dashboard
- Tap "Forgot Password?" → Password Recovery Flow
- Tap "Register" → Register Screen

**Validation:**
- Phone: Must be valid Ghana number (+233 format)
- Password: Minimum 6 characters
- Show loading state during authentication

---

### 2.3 Register Screen (Step 1)
**Sequence:** From Welcome Screen  
**Purpose:** Create new account

**Required Elements:**
- Back button (←, top left)
- Title: "Create Account" (Headline Medium)
- Subtitle: "Join Ntamgyinafoɔ today" (Body Medium, Secondary)
- Full Name input:
  - Label: "👤 Full Name"
  - Placeholder: "Enter your full name"
  - Required field
- Phone Number input:
  - Label: "📱 Phone Number"
  - Placeholder: "+233 XX XXX XXXX"
  - Country code selector
  - Required field
- Password input:
  - Label: "🔒 Password"
  - Placeholder: "Create password (min 6 characters)"
  - Show/Hide toggle
  - Required field
- Confirm Password input:
  - Label: "🔒 Confirm Password"
  - Placeholder: "Re-enter password"
  - Show/Hide toggle
  - Required field
- Role Selection:
  - Title: "I am a:"
  - Radio buttons:
    - ○ Buyer/Tenant
    - ○ Property Owner
  - Required selection
- "Continue" button (Primary, full width, disabled until all fields valid)
- Footer: "By continuing, you agree to our [Terms] and [Privacy Policy]"

**Functionality:**
- Validate all fields
- Check password match
- Validate phone format
- Show error messages
- Tap "Continue" → Send OTP → OTP Verification Screen

**Validation:**
- Full Name: Minimum 2 characters
- Phone: Valid Ghana number
- Password: Minimum 6 characters, must match confirmation
- Role: Must select one option

---

### 2.4 OTP Verification Screen
**Sequence:** After Register Screen  
**Purpose:** Verify phone number

**Required Elements:**
- Back button (←, top left)
- Title: "Verify Phone" (Headline Medium)
- Description: "We sent a code to +233 XX XXX XXXX" (Body Medium)
- 6 OTP input boxes (side by side)
- "Didn't receive code?" text
- "Resend" button (Text button, with countdown timer "Resend in 00:30")
- "Verify" button (Primary, full width, disabled until 6 digits entered)
- "Change Phone Number" link (Text button, bottom)

**Functionality:**
- Auto-focus next input on digit entry
- Auto-submit when 6 digits entered
- Resend OTP (with 30-second cooldown)
- Validate OTP with backend
- Show error for invalid OTP
- Tap "Verify" → Validate → Role Selection Screen
- Tap "Change Phone Number" → Back to Register Screen

**Validation:**
- All 6 digits must be entered
- OTP must match sent code
- Maximum 3 attempts before lockout

---

### 2.5 Role Selection Screen
**Sequence:** After OTP Verification  
**Purpose:** Complete profile setup based on role

**Required Elements:**
- Title: "Complete Your Profile" (Headline Medium)
- Role indicator (Buyer/Tenant or Property Owner)

**If Buyer/Tenant Selected:**
- Preferred Locations (multi-select):
  - Checkboxes for regions/cities
  - "Select all" option
- Budget Range:
  - Min price slider/input
  - Max price slider/input
  - Display: "GHS X - GHS Y"
- Property Type Interest:
  - Checkboxes: House, Apartment, Land, Commercial
- Profile Photo (optional):
  - Camera icon
  - "Add Photo" button
  - Image preview if added
- "Create Account" button (Primary)

**If Property Owner Selected:**
- Upload ID Document:
  - "Upload Ghana Card/Voter ID" button
  - File picker (camera or gallery)
  - Preview of uploaded document
  - Required field
- Take Selfie for Verification:
  - Camera button
  - "Take Selfie" button
  - Preview of selfie
  - Required field
- Profile Photo (optional):
  - Camera icon
  - "Add Photo" button
- "Submit for Verification" button (Primary)

**Functionality:**
- Buyer: Tap "Create Account" → Buyer Home
- Owner: Tap "Submit" → Upload to backend → Pending Verification Screen

---

### 2.6 Pending Verification Screen (Owners Only)
**Sequence:** After Owner registration  
**Purpose:** Inform owner of verification status

**Required Elements:**
- Icon: ⏳ (clock/hourglass)
- Title: "Verification Pending" (Headline Medium)
- Message: "Your account is being reviewed. We'll notify you once verified." (Body Large)
- Estimated time: "Usually takes 24-48 hours"
- "Go to Dashboard" button (Secondary, disabled until approved)
- "Contact Support" link (Text button)

**Functionality:**
- Show status updates
- Push notification when approved
- Auto-navigate to Owner Dashboard when approved

---

### 2.7 Password Recovery Flow

#### 2.7.1 Forgot Password Screen
**Sequence:** From Login Screen  
**Required Elements:**
- Back button
- Title: "Reset Password"
- Phone Number input
- "Send Reset Code" button
- "Back to Login" link

#### 2.7.2 Reset OTP Screen
**Sequence:** After Forgot Password  
**Required Elements:**
- Same as OTP Verification Screen
- "Verify" → New Password Screen

#### 2.7.3 New Password Screen
**Sequence:** After Reset OTP  
**Required Elements:**
- New Password input
- Confirm Password input
- "Reset Password" button
- Success message → Login Screen

---

## 3. Buyer Journey Screens

### 3.1 Buyer Home Screen
**Sequence:** Main screen for buyers (after login)  
**Purpose:** Property discovery and browsing

**Required Elements:**
- Header:
  - Location selector: "📍 Accra" (tap to change)
  - Notification bell icon (🔔, top right, with badge if unread)
- Search Bar:
  - Placeholder: "🔍 Search properties..."
  - Full width, rounded corners
  - Tap → Search Screen
- Categories Section:
  - Title: "Categories"
  - Horizontal scroll cards:
    - 🏠 House
    - 🏢 Apartment
    - 🏞️ Land
    - 🏪 Commercial
  - Each card: Icon + Label
- Featured Properties Section:
  - Title: "Featured Properties" + "See All →"
  - Horizontal scroll cards (2 visible)
  - Each card:
    - Property image (4:5 aspect ratio)
    - Title (2 lines max)
    - Price (Primary Green, bold)
    - Save icon (heart, top right)
- Near You Section:
  - Title: "Near You" + "See All →"
  - Vertical list of property cards:
    - Image (120x120px, left)
    - Title (1 line, ellipsis)
    - Location (Secondary color)
    - Price (Primary Green, bold)
    - Bedrooms/Bathrooms chips
    - Save icon (heart, top right)
- Bottom Navigation:
  - 🏠 Home (active)
  - 🔍 Search
  - 🗺 Map
  - 💬 Messages
  - 👤 Profile

**Functionality:**
- Pull to refresh
- Tap category → Filtered Search Results
- Tap property card → Property Detail Screen
- Tap "See All" → Search Results Screen
- Tap search bar → Search Screen
- Tap notification → Notifications Screen

---

### 3.2 Search Screen
**Sequence:** From Home Screen (tap search bar)  
**Purpose:** Search and filter properties

**Required Elements:**
- Header:
  - Back button (←)
  - Search input (focused, with keyboard)
  - Filter button (⚙️, right)
  - View toggle (List/Grid, right)
- Active Filters Bar (if filters applied):
  - Chips showing active filters
  - "Clear All" button
- Results Count: "234 properties found"
- Property List/Grid:
  - Same as Search Results Screen
- Bottom Navigation (same as Home)

**Functionality:**
- Real-time search as user types
- Tap filter → Filter Bottom Sheet
- Tap property → Property Detail Screen
- Swipe down to dismiss keyboard

---

### 3.3 Search Results Screen
**Sequence:** From Search or Filter  
**Purpose:** Display filtered property results

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "Search Results"
  - Filter button (⚙️)
  - Menu button (≡)
- Breadcrumb: "Accra • Houses • Buy"
- Results count: "234 properties found"
- Action Bar:
  - "Filter" button
  - "Sort ▼" dropdown
  - "Map" toggle button
- Property List:
  - List view cards (horizontal layout):
    - Image (120x120px, left)
    - Title (1 line)
    - Location (Secondary)
    - Price (Primary Green)
    - Bedrooms/Bathrooms chips
    - Save icon (heart)
  - OR Grid view (2 columns)
- Load More indicator (bottom)
- Bottom Navigation

**Functionality:**
- Tap filter → Filter Bottom Sheet
- Tap sort → Sort options dropdown
- Tap map toggle → Map View
- Tap property → Property Detail Screen
- Infinite scroll (load more)
- Pull to refresh

---

### 3.4 Filter Bottom Sheet
**Sequence:** From Search Results or Search Screen  
**Purpose:** Apply property filters

**Required Elements:**
- Handle bar (top, centered)
- Header:
  - Title: "Filters"
  - "Reset" button (right)
- Scrollable content:
  - Property Type:
    - Chips: [House] [Apt] [Land] [Commercial] [All]
  - Transaction Type:
    - Chips: [Buy] [Rent]
  - Price Range:
    - Title: "Price Range (GHS)"
    - Dual slider (Min/Max)
    - Display: "0 - 2M+"
    - Min/Max inputs
  - Bedrooms:
    - Chips: [Any] [1] [2] [3] [4] [5+]
  - Amenities:
    - Checkboxes:
      - ☑ Water
      - ☑ Electricity
      - ☐ Security
      - ☐ Parking
      - ☐ Internet
      - ☐ Pool
- Footer:
  - "Show 234 Properties" button (Primary, full width)

**Functionality:**
- Apply filters in real-time
- Tap "Reset" → Clear all filters
- Tap "Show X Properties" → Apply filters → Search Results Screen
- Swipe down to dismiss

---

### 3.5 Map View Screen
**Sequence:** From Home, Search, or Search Results  
**Purpose:** Visual property discovery on map

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "Map View"
  - Filter button (⚙️)
  - View toggle (Map/Satellite)
- Map (full screen):
  - Property markers/pins
  - Clusters for dense areas
  - User location (blue dot)
  - Tap pin → Property popup card
- Property Popup Card (when pin tapped):
  - Image (100x100px)
  - Title
  - Location
  - Price
  - "View Details" button
- Bottom Sheet (optional):
  - List of nearby properties
  - Swipe up to expand
- Bottom Navigation

**Functionality:**
- Tap pin → Show property popup
- Tap "View Details" → Property Detail Screen
- Pan/zoom map
- Tap filter → Filter Bottom Sheet
- Show user location
- Show nearby properties

---

### 3.6 Property Detail Screen
**Sequence:** From any property card/list  
**Purpose:** View complete property information

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "Property"
  - Share button (↗️)
  - Save button (❤️)
- Image Carousel:
  - Main image (full width)
  - Image counter: "1/15"
  - Dot indicators
  - Swipe left/right
  - Media badges: [📷15] [🎥 3] [🔄360°]
- Property Info:
  - Title: "4 Bedroom House" (Headline Medium)
  - Location: "📍 East Legon, Accra" (Body Medium)
  - Price: "GHS 850,000" (Headline Large, Primary Green)
  - Negotiable badge (if applicable)
- Quick Stats:
  - 🛏 4 Beds
  - 🚿 3 Baths
  - 📐 2 Plot Size
  - Cards in horizontal row
- Description:
  - Title: "Description"
  - Text (truncated, max 3 lines)
  - "Read More" link
- Amenities:
  - Title: "Amenities"
  - Checkmarks: ✓Water ✓Electricity ✓Security ✓Parking
  - Grid layout
- Location Section:
  - Title: "Location" + "View" button
  - Map preview (small)
  - Address text
- Listed By Section:
  - Owner avatar
  - Owner name + Verified badge
  - "Member since 2023"
  - "View Profile" button
- Action Buttons (bottom, fixed):
  - "📞 Call" button (Primary, left)
  - "💬 Chat" button (Primary, right)
- Subscription Gate (if not subscribed):
  - Overlay: "Subscribe to view full details"
  - "View Plans" button

**Functionality:**
- Tap image → Full Screen Gallery
- Tap "View" (location) → Full Map View
- Tap "View Profile" → Owner Profile Screen
- Tap "Call" → Check subscription → Phone dialer
- Tap "Chat" → Check subscription → Chat Screen
- Tap "Save" → Toggle saved state
- Tap "Share" → Share sheet
- Swipe images left/right
- Tap media badges → Media Viewer

---

### 3.7 Property Gallery Screen
**Sequence:** From Property Detail Screen  
**Purpose:** View all property photos

**Required Elements:**
- Header:
  - Close button (✕)
  - Image counter: "1/15"
- Full screen image viewer:
  - Swipeable images
  - Pinch to zoom
  - Double tap to zoom
- Thumbnail strip (bottom, optional):
  - Small thumbnails
  - Scrollable
  - Tap to jump to image
- Media tabs:
  - [Photos] [Videos] [360°]
- Bottom Navigation (hidden)

**Functionality:**
- Swipe to navigate images
- Pinch/zoom gestures
- Tap thumbnail → Jump to image
- Tap close → Back to Property Detail

---

### 3.8 360° Viewer Screen
**Sequence:** From Property Detail or Gallery  
**Purpose:** Interactive 360° property view

**Required Elements:**
- Header:
  - Close button (✕)
  - "🔄 Auto" toggle (right)
- 360° panorama viewer (full screen):
  - Interactive drag to look around
  - Gyroscope support (if enabled)
- Room indicator: "Living Room"
- Navigation: "← Swipe for more →"
- Bottom Navigation (hidden)

**Functionality:**
- Drag to rotate view
- Swipe left/right for different rooms
- Auto-rotate toggle
- Gyroscope mode (if device supports)

---

### 3.9 Saved Properties Screen
**Sequence:** From Profile or Home  
**Purpose:** View saved/favorited properties

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "Saved Properties"
  - Filter/Sort button (⚙️)
- Property List:
  - Same as Search Results list view
  - Empty state if no saved properties:
    - Illustration
    - "No Properties Yet"
    - "Properties you save will appear here"
    - "Browse Properties" button
- Bottom Navigation

**Functionality:**
- Tap property → Property Detail Screen
- Swipe to unsave (optional)
- Pull to refresh
- Filter/sort saved properties

---

### 3.10 Subscription Plans Screen (Buyer)
**Sequence:** From Property Detail (gate) or Profile  
**Purpose:** Subscribe for full access

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "Choose Plan"
- Title: "Unlock Full Access" (Headline Large)
- Plan Cards (vertical list):
  - **BASIC Plan:**
    - Price: "GHS 30/month"
    - Features:
      - ✓ Full property details
      - ✓ 2 owner contacts
      - ✓ 30 days access
    - "Select" button
  - **STANDARD Plan (Popular badge):**
    - Badge: "⭐ POPULAR"
    - Price: "GHS 50/month"
    - Features:
      - ✓ Everything in Basic
      - ✓ Saved searches
      - ✓ 60 days access
    - "Select" button
  - **PREMIUM Plan:**
    - Badge: "💎 PREMIUM"
    - Price: "GHS 70/month"
    - Features:
      - ✓ Everything in Standard
      - ✓ Early notifications
      - ✓ 90 days access
    - "Select" button

**Functionality:**
- Tap plan → Payment Screen
- Show current plan (if subscribed)
- Highlight selected plan

---

### 3.11 Payment Screen
**Sequence:** From Subscription Plans Screen  
**Purpose:** Process subscription payment

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "Payment"
- Selected Plan Card:
  - Plan name
  - Price
  - Duration
- Payment Method Selection:
  - Title: "Select Payment Method"
  - Options:
    - Mobile Money (MoMo)
    - Card (Visa/Mastercard)
- Payment Form (MoMo):
  - Phone Number input
  - Network selector (MTN/Vodafone/AirtelTigo)
- Payment Form (Card):
  - Card Number input
  - Expiry Date
  - CVV
  - Cardholder Name
- "Confirm Payment" button (Primary)
- Security badges (Paystack, SSL)

**Functionality:**
- Select payment method
- Fill payment details
- Process via Paystack
- Show loading state
- Success → Receipt Screen
- Error → Show error message

---

### 3.12 Payment Receipt Screen
**Sequence:** After successful payment  
**Purpose:** Confirm payment and activate subscription

**Required Elements:**
- Success icon (✓)
- Title: "Payment Successful" (Headline Medium)
- Receipt Details:
  - Transaction ID
  - Plan Name
  - Amount Paid
  - Date
  - Expiry Date
- "Download Receipt" button (Secondary)
- "Continue" button (Primary)
- "Share Receipt" option

**Functionality:**
- Activate subscription
- Tap "Continue" → Property Detail Screen (with full access)
- Download/share receipt

---

## 4. Owner Journey Screens

### 4.1 Owner Dashboard
**Sequence:** Main screen for owners (after login)  
**Purpose:** Overview of owner's listings and activity

**Required Elements:**
- Header:
  - Greeting: "Hi, Kofi 👋" (Headline Medium)
  - Notification bell (🔔, with badge)
- Stats Cards (2x2 grid):
  - Views: "234" (large number)
  - Inquiries: "12" (large number)
  - Active Listings: "2" (large number)
  - Pending: "1" (large number)
- Subscription Card:
  - Plan name: "Basic Plan"
  - Usage: "1/2 listings used"
  - Expiry: "Expires: Jan 15"
  - "Renew" button (right)
- Recent Inquiries Section:
  - Title: "Recent Inquiries" + "See All →"
  - Inquiry cards:
    - Buyer avatar
    - Buyer name
    - Property title (truncated)
    - Time: "2 hours ago"
    - Arrow (→)
- "Add New Listing" button (Primary, large, bottom)
- Bottom Navigation:
  - 📊 Dashboard (active)
  - 🏠 My Listings
  - ➕ Add Listing
  - 💬 Messages
  - 👤 Profile

**Functionality:**
- Tap stat card → Detailed analytics
- Tap inquiry → Chat Screen
- Tap "Add New Listing" → Create Listing Flow
- Tap "Renew" → Subscription Plans Screen
- Pull to refresh

---

### 4.2 My Listings Screen
**Sequence:** From Owner Dashboard  
**Purpose:** Manage owner's property listings

**Required Elements:**
- Header:
  - Back button (←)
  - Title: "My Listings"
  - Filter/Sort button (⚙️)
- Status Tabs:
  - [All] [Active] [Pending] [Sold] [Rented]
- Listing Cards:
  - Property image
  - Title
  - Status badge (Active/Pending/Sold/Rented)
  - Stats: Views, Inquiries
  - Actions: [Edit] [Stats] [Status]
- Empty state (if no listings):
  - Illustration
  - "No Listings Yet"
  - "Create your first listing"
  - "Add Listing" button
- Bottom Navigation

**Functionality:**
- Tap listing → Listing Detail Screen
- Tap "Edit" → Edit Listing Flow
- Tap "Stats" → Listing Analytics Screen
- Tap "Status" → Change Status Modal
- Filter by status
- Pull to refresh

---

### 4.3 Create Listing Flow

#### 4.3.1 Step 1: Property Type
**Sequence:** From Owner Dashboard  
**Required Elements:**
- Header:
  - Back button (←)
  - Title: "New Listing"
- Progress: "Step 1 of 10" + progress bar
- Title: "What type of property?"
- Property Type Cards:
  - 🏠 House
  - 🏢 Apartment
  - 🏞️ Land
  - 🏪 Commercial
  - Each with selection indicator
- "Continue" button (Primary, disabled until selected)

**Functionality:**
- Select property type
- Tap "Continue" → Step 2

---

#### 4.3.2 Step 2: Transaction Type
**Required Elements:**
- Progress: "Step 2 of 10"
- Title: "Transaction Type"
- Options:
  - [For Sale] [For Rent]
- "Continue" button

---

#### 4.3.3 Step 3: Basic Details
**Required Elements:**
- Progress: "Step 3 of 10"
- Title: "Property Details"
- Inputs:
  - Title (required)
  - Description (required, multiline)
  - Bedrooms (number picker)
  - Bathrooms (number picker)
  - Plot Size (number + unit)
- "Continue" button

---

#### 4.3.4 Step 4: Price
**Required Elements:**
- Progress: "Step 4 of 10"
- Title: "Set Price"
- Price input (GHS)
- Negotiable toggle
- "Continue" button

---

#### 4.3.5 Step 5: Amenities
**Required Elements:**
- Progress: "Step 5 of 10"
- Title: "Amenities"
- Checkboxes:
  - Water
  - Electricity
  - Security
  - Parking
  - Internet
  - Pool
  - etc.
- "Continue" button

---

#### 4.3.6 Step 6: Photos
**Required Elements:**
- Progress: "Step 6 of 10"
- Title: "Add Photos"
- Subtitle: "Minimum 5, Maximum 15"
- Photo Grid:
  - Uploaded photos (with delete ✕)
  - "+ Add Photo" button
- Photo counter: "5/15 photos added"
- Tips section:
  - "💡 Tips:"
  - Bullet points
- "Continue" button (disabled until 5 photos)

**Functionality:**
- Tap "+ Add Photo" → Camera/Gallery picker
- Drag to reorder
- Tap ✕ to delete
- Validate minimum 5 photos

---

#### 4.3.7 Step 7: Video (Optional)
**Required Elements:**
- Progress: "Step 7 of 10"
- Title: "Add Video (Optional)"
- Subtitle: "Maximum 3 videos, 2 minutes each"
- Video list with previews
- "+ Add Video" button
- "Skip" button (Text)
- "Continue" button

---

#### 4.3.8 Step 8: 360° View (Optional)
**Required Elements:**
- Progress: "Step 8 of 10"
- Title: "Add 360° View (Optional)"
- Instructions for capturing 360°
- Camera button
- Preview if added
- "Skip" button
- "Continue" button

---

#### 4.3.9 Step 9: Location
**Required Elements:**
- Progress: "Step 9 of 10"
- Title: "Set Location"
- Map view (full width)
- Draggable pin (📍)
- "🎯 Use My Location" button
- Address display (auto-filled from coordinates)
- "Confirm Location" button

**Functionality:**
- Auto-capture GPS on "Use My Location"
- Drag pin to adjust
- Auto-fill address from coordinates
- Validate location is set

---

#### 4.3.10 Step 10: Preview & Submit
**Required Elements:**
- Progress: "Step 10 of 10" + "━━━━━━━━━━━━━━━━━━"
- Title: "Preview Listing"
- Scrollable preview:
  - All images
  - Title
  - Description
  - Price
  - Details
  - Location map
- "Edit" buttons for each section
- "Submit for Review" button (Primary)

**Functionality:**
- Review all details
- Tap "Edit" → Go back to that step
- Tap "Submit" → Upload → Pending Approval Screen

---

### 4.4 Pending Approval Screen
**Sequence:** After submitting listing  
**Purpose:** Inform owner of review status

**Required Elements:**
- Icon: ⏳
- Title: "Listing Under Review"
- Message: "Your listing is being reviewed. We'll notify you once approved."
- Estimated time: "Usually takes 24-48 hours"
- "Back to Dashboard" button

**Functionality:**
- Show status updates
- Push notification when approved
- Auto-navigate to My Listings when approved

---

### 4.5 Listing Detail Screen (Owner View)
**Sequence:** From My Listings  
**Purpose:** View and manage single listing

**Required Elements:**
- Same as Property Detail Screen (Buyer view)
- Additional Owner Actions:
  - "Edit Listing" button
  - "View Stats" button
  - "Change Status" button
  - "Delete Listing" button (danger)

**Functionality:**
- Edit listing details
- View performance metrics
- Change listing status
- Delete listing (with confirmation)

---

### 4.6 Listing Analytics Screen
**Sequence:** From Listing Detail  
**Purpose:** View listing performance

**Required Elements:**
- Header:
  - Back button
  - Title: "Listing Analytics"
- Stats Cards:
  - Total Views
  - Unique Views
  - Saves/Favorites
  - Inquiries
  - Messages
- Charts:
  - Views over time (line chart)
  - Traffic sources
- "Export Report" button

---

### 4.7 Inquiries Screen
**Sequence:** From Owner Dashboard  
**Purpose:** View all property inquiries

**Required Elements:**
- Header:
  - Back button
  - Title: "Inquiries"
  - Filter button
- Inquiry List:
  - Buyer avatar
  - Buyer name
  - Property title
  - Inquiry message (preview)
  - Time stamp
  - Status badge (New/Replied)
- Empty state if no inquiries
- Bottom Navigation

**Functionality:**
- Tap inquiry → Chat Screen
- Filter by property/status
- Mark as read/unread

---

### 4.8 Subscription Plans Screen (Owner)
**Sequence:** From Owner Dashboard  
**Purpose:** Subscribe for listing slots

**Required Elements:**
- Similar to Buyer Subscription Screen
- Plans:
  - **Basic:** GHS 50/month, 2 listings, 30 days
  - **Standard:** GHS 80/month, 2 listings, 60 days
  - **Premium:** GHS 120/month, 2 listings, 90 days
- Show current plan
- Show usage: "1/2 listings used"

---

## 5. Shared Screens

### 5.1 Chat List Screen
**Sequence:** From Bottom Navigation  
**Purpose:** View all conversations

**Required Elements:**
- Header:
  - Title: "Messages"
  - Search button (🔍)
- Conversation List:
  - Avatar
  - Name
  - Last message preview
  - Time stamp
  - Unread badge (if applicable)
  - Property context (if from property)
- Empty state if no messages
- Bottom Navigation

**Functionality:**
- Tap conversation → Chat Screen
- Search conversations
- Pull to refresh
- Swipe to delete/archive

---

### 5.2 Chat Screen
**Sequence:** From Chat List or Property Detail  
**Purpose:** Messaging with buyer/owner

**Required Elements:**
- Header:
  - Back button (←)
  - Recipient name + avatar
  - Call button (📞)
  - Menu (⋮)
  - Property context: "About: 4 Bed House"
- Message List:
  - Date separator: "Jan 15, 2024"
  - Sent messages (right aligned, Primary Green background)
  - Received messages (left aligned, White background)
  - Time stamps
  - Read receipts (✓✓)
- Input Bar (bottom, fixed):
  - Attachment button (📎)
  - Text input
  - Send button (▶️)

**Functionality:**
- Send text messages
- Send images
- Voice call (tap 📞)
- View property details
- Block/report user (from menu)

---

### 5.3 Profile Screen
**Sequence:** From Bottom Navigation  
**Purpose:** User profile and settings

**Required Elements:**
- Profile Header:
  - Avatar (large)
  - Name
  - Verified badge (if applicable)
  - Role badge (Buyer/Owner)
  - "Edit Profile" button
- Stats (if Owner):
  - Listings count
  - Inquiries count
- Menu Items:
  - My Listings (Owners only)
  - Saved Properties (Buyers only)
  - Subscription
  - Payment Methods
  - Notifications
  - Help & Support
  - About
  - Terms & Privacy
  - Logout
- Bottom Navigation

**Functionality:**
- Edit profile details
- Manage subscription
- View settings
- Logout (with confirmation)

---

### 5.4 Edit Profile Screen
**Sequence:** From Profile Screen  
**Required Elements:**
- Header:
  - Back button
  - Title: "Edit Profile"
  - Save button (right)
- Avatar:
  - Current photo
  - "Change Photo" button
- Inputs:
  - Full Name
  - Phone Number (read-only)
  - Email (optional)
  - Bio (optional)
- "Save Changes" button

---

### 5.5 Notifications Screen
**Sequence:** From Header bell icon  
**Required Elements:**
- Header:
  - Back button
  - Title: "Notifications"
  - "Mark All Read" button
- Notification List:
  - Icon
  - Title
  - Message
  - Time stamp
  - Unread indicator
  - Tap → Navigate to related screen
- Empty state if no notifications
- Filter tabs: [All] [Unread]

**Functionality:**
- Tap notification → Navigate to related screen
- Mark as read
- Delete notification
- Pull to refresh

---

### 5.6 Settings Screen
**Sequence:** From Profile Screen  
**Required Elements:**
- Sections:
  - Account
  - Notifications
  - Privacy
  - App Settings
  - About
- Toggles and options for each setting
- "Logout" button (danger, bottom)

---

## 6. Admin Panel Screens

### 6.1 Admin Dashboard
**Sequence:** Main screen for admins  
**Purpose:** Platform overview and management

**Required Elements:**
- Header:
  - Title: "Admin Dashboard"
  - User count, Property count
- Key Metrics Cards:
  - Total Users
  - Active Listings
  - Pending Approvals
  - Revenue (today/month)
- Quick Actions:
  - Review Properties
  - Review Users
  - View Reports
- Sections:
  - Pending Approvals (users + properties)
  - Recent Activity
  - System Alerts

---

### 6.2 User Management Screen
**Sequence:** From Admin Dashboard  
**Required Elements:**
- User List with filters
- User cards:
  - Avatar
  - Name
  - Role
  - Status (Active/Suspended)
  - Verification status
  - Actions: [View] [Verify] [Suspend] [Delete]

---

### 6.3 Property Queue Screen
**Sequence:** From Admin Dashboard  
**Required Elements:**
- Pending listings list
- Listing cards with:
  - Property details
  - Owner info
  - Actions: [Approve] [Reject] [View Details]

---

### 6.4 Payment Reports Screen
**Sequence:** From Admin Dashboard  
**Required Elements:**
- Revenue charts
- Transaction list
- Filters (date range, plan type)
- Export options

---

## Screen Summary

**Total Screens: 45+**

### By Category:
- **Onboarding:** 5 screens
- **Authentication:** 8 screens
- **Buyer:** 12 screens
- **Owner:** 15 screens
- **Shared:** 6 screens
- **Admin:** 4+ screens

### Priority Order (P1 = Must Have):
- P1: Splash, Onboarding, Welcome, Login, Register, OTP, Role Selection
- P1: Buyer Home, Search, Property Detail, Subscription, Payment
- P1: Owner Dashboard, Create Listing, My Listings
- P1: Chat, Profile, Settings
- P2: Map View, 360° Viewer, Analytics, Admin Panel

---

*Last Updated: December 2024*

