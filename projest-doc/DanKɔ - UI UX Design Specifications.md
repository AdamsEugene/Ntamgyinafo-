# Ntamgyinafoɔ – UI/UX Design Specifications

## 1. Design System Overview

### 1.1 Brand Identity

**App Name:** Ntamgyinafoɔ
**Tagline:** Find. Visit. Own.
**Brand Personality:** Trustworthy, Modern, Local, Accessible

### 1.2 Color Palette

#### Primary Colors
```
Primary Green:     #1B5E20  (Dark Green - Trust, Growth)
Primary Light:     #4CAF50  (Light Green - Action buttons)
Primary Dark:      #0D3311  (Very Dark - Headers)
```

#### Secondary Colors
```
Accent Gold:       #FFB300  (Premium, Featured)
Accent Orange:     #FF6D00  (Notifications, Alerts)
```

#### Neutral Colors
```
Background:        #FAFAFA  (Light mode background)
Surface:           #FFFFFF  (Cards, modals)
Text Primary:      #212121  (Main text)
Text Secondary:    #757575  (Subtitles, hints)
Divider:           #E0E0E0  (Lines, borders)
```

#### Semantic Colors
```
Success:           #4CAF50
Warning:           #FFC107
Error:             #F44336
Info:              #2196F3
```

#### Dark Mode
```
Background Dark:   #121212
Surface Dark:      #1E1E1E
Text Dark:         #FFFFFF
Text Secondary:    #B0B0B0
```

### 1.3 Typography

#### Font Family
**Primary:** Inter (Google Fonts - Free)
**Fallback:** SF Pro Display (iOS), Roboto (Android)

#### Type Scale
```
Display Large:     32px / Bold / -0.5 tracking
Display Medium:    28px / Bold / -0.25 tracking
Headline Large:    24px / SemiBold / 0 tracking
Headline Medium:   20px / SemiBold / 0 tracking
Title Large:       18px / Medium / 0 tracking
Title Medium:      16px / Medium / 0.15 tracking
Body Large:        16px / Regular / 0.5 tracking
Body Medium:       14px / Regular / 0.25 tracking
Label Large:       14px / Medium / 0.1 tracking
Label Medium:      12px / Medium / 0.5 tracking
Caption:           12px / Regular / 0.4 tracking
```

### 1.4 Spacing System

```
4px   - xs  (tight spacing)
8px   - sm  (icon padding)
12px  - md  (button padding)
16px  - lg  (card padding)
24px  - xl  (section spacing)
32px  - 2xl (screen padding)
48px  - 3xl (major sections)
```

### 1.5 Border Radius

```
Small:    4px   (buttons, chips)
Medium:   8px   (cards, inputs)
Large:    12px  (modals, sheets)
XLarge:   16px  (images, avatars)
Full:     9999px (pills, circular)
```

### 1.6 Shadows

```
Elevation 1:  0 1px 2px rgba(0,0,0,0.05)   - Cards
Elevation 2:  0 2px 4px rgba(0,0,0,0.1)    - Raised cards
Elevation 3:  0 4px 8px rgba(0,0,0,0.12)   - Dropdowns
Elevation 4:  0 8px 16px rgba(0,0,0,0.15)  - Modals
Elevation 5:  0 16px 32px rgba(0,0,0,0.2)  - Dialogs
```

---

## 2. Component Library

### 2.1 Buttons

#### Primary Button
```
Background: Primary Green (#1B5E20)
Text: White
Height: 48px
Padding: 16px 24px
Border Radius: 8px
Font: Label Large, SemiBold

States:
- Default: #1B5E20
- Pressed: #0D3311
- Disabled: #E0E0E0 (text #9E9E9E)
- Loading: Show spinner, disable tap
```

#### Secondary Button
```
Background: Transparent
Border: 1px solid Primary Green
Text: Primary Green
Height: 48px
```

#### Text Button
```
Background: Transparent
Text: Primary Green
Height: 40px
Padding: 8px 16px
```

#### Icon Button
```
Size: 40px x 40px
Icon Size: 24px
Background: Transparent or Surface
Border Radius: Full (circular)
```

### 2.2 Input Fields

#### Text Input
```
Height: 56px
Background: #F5F5F5
Border: None (default), 2px Primary (focused)
Border Radius: 8px
Padding: 16px
Label: Float above when focused/filled
Helper Text: Below, 12px, Secondary color
Error State: Red border, red helper text
```

#### Search Input
```
Height: 48px
Background: White
Border: 1px #E0E0E0
Border Radius: 24px (pill)
Left Icon: Search
Right Icon: Clear (when has text)
```

#### Dropdown/Select
```
Same as Text Input
Right Icon: Chevron Down
Opens: Bottom sheet on mobile
```

### 2.3 Cards

#### Property Card (List View)
```
Width: Full width - 32px padding
Height: 120px
Layout: Horizontal
- Left: Image (120px x 120px, radius 8px)
- Right: Content
  - Title (Title Medium, 1 line, ellipsis)
  - Location (Body Medium, Secondary, 1 line)
  - Price (Headline Medium, Primary Green)
  - Tags: Bedrooms, Bathrooms (chips)
- Top Right: Save icon (heart)
Background: White
Shadow: Elevation 1
Border Radius: 12px
```

#### Property Card (Grid View)
```
Width: (Screen - 48px) / 2
Aspect Ratio: 4:5
Layout: Vertical
- Top: Image (full width, 60% height)
- Bottom: Content (40% height)
  - Title (Title Medium, 2 lines max)
  - Location (Caption, Secondary)
  - Price (Title Large, Primary Green)
- Overlay: Save icon top-right of image
Background: White
Shadow: Elevation 1
Border Radius: 12px
```

#### Property Card (Map Popup)
```
Width: 280px
Height: 100px
Layout: Horizontal
- Left: Image (100px x 100px)
- Right: Title, Location, Price
Border Radius: 8px
Shadow: Elevation 3
```

### 2.4 Navigation

#### Bottom Navigation Bar
```
Height: 64px + Safe Area
Background: White
Shadow: Elevation 2 (top)
Items: 5 (Home, Search, Map, Messages, Profile)
Active: Primary Green icon + label
Inactive: #757575 icon, no label
Icon Size: 24px
```

#### Top App Bar
```
Height: 56px
Background: White or Transparent
Title: Headline Medium, centered or left
Actions: Icon buttons, right aligned
Back Button: Arrow left, left aligned
```

#### Tab Bar
```
Height: 48px
Background: White
Indicator: 2px Primary Green, bottom
Active Tab: Primary Green text
Inactive Tab: Secondary text
```

### 2.5 Bottom Sheets

```
Background: White
Border Radius: 16px 16px 0 0
Handle: 40px x 4px, centered, #E0E0E0
Max Height: 90% screen
Overlay: Black 50% opacity
```

### 2.6 Chips/Tags

```
Height: 32px
Padding: 8px 12px
Background: #E8F5E9 (light green)
Text: Primary Green, Label Medium
Border Radius: Full (pill)
Icon: 16px, optional left icon
```

### 2.7 Badges

```
Size: 18px minimum
Background: Error Red or Accent Orange
Text: White, 10px Bold
Border Radius: Full
Position: Top-right of icon, offset -4px
```

---

## 3. Screen Designs

### 3.1 Onboarding Screens

#### Splash Screen
```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│        [LOGO]           │
│        Ntamgyinafoɔ            │
│                         │
│   Find. Visit. Own.     │
│                         │
│                         │
│      [Loading...]       │
│                         │
└─────────────────────────┘

- Centered logo (120px)
- App name below (Display Large)
- Tagline (Body Large, Secondary)
- Loading indicator at bottom
- Background: Primary Green gradient
```

#### Onboarding Slides (4 screens)
```
┌─────────────────────────┐
│                         │
│     [Illustration]      │
│        (60%)            │
│                         │
├─────────────────────────┤
│                         │
│   Find Your Dream       │
│      Property           │
│                         │
│  Browse thousands of    │
│  verified properties    │
│  across Ghana           │
│                         │
│       ● ○ ○ ○           │
│                         │
│     [Get Started]       │
│                         │
└─────────────────────────┘

Slides:
1. Find Properties - Browse listings
2. Visual Tours - 360° and video
3. Exact Locations - GPS maps
4. Direct Contact - Chat with owners
```

### 3.2 Authentication Screens

#### Welcome Screen
```
┌─────────────────────────┐
│                         │
│        [LOGO]           │
│        Ntamgyinafoɔ            │
│                         │
│   The #1 Property App   │
│       in Ghana          │
│                         │
│  ┌─────────────────┐    │
│  │     Login       │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │  Create Account │    │
│  └─────────────────┘    │
│                         │
│   [Explore as Guest]    │
│                         │
└─────────────────────────┘
```

#### Login Screen
```
┌─────────────────────────┐
│ ←                       │
│                         │
│     Welcome Back        │
│  Sign in to continue    │
│                         │
│  ┌─────────────────┐    │
│  │ 📱 Phone Number │    │
│  │ +233 XX XXX XXXX│    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 🔒 Password     │    │
│  │ ••••••••        │ 👁 │
│  └─────────────────┘    │
│                         │
│     [Forgot Password?]  │
│                         │
│  ┌─────────────────┐    │
│  │     Sign In     │    │
│  └─────────────────┘    │
│                         │
│  Don't have an account? │
│      [Register]         │
└─────────────────────────┘
```

#### Register Screen
```
┌─────────────────────────┐
│ ←                       │
│                         │
│    Create Account       │
│   Join Ntamgyinafoɔ today      │
│                         │
│  ┌─────────────────┐    │
│  │ 👤 Full Name    │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 📱 Phone Number │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 🔒 Password     │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 🔒 Confirm      │    │
│  └─────────────────┘    │
│                         │
│  I am a:                │
│  ○ Buyer/Tenant         │
│  ○ Property Owner       │
│                         │
│  ┌─────────────────┐    │
│  │    Continue     │    │
│  └─────────────────┘    │
│                         │
│  By continuing, you     │
│  agree to our [Terms]   │
└─────────────────────────┘
```

#### OTP Verification
```
┌─────────────────────────┐
│ ←                       │
│                         │
│    Verify Phone         │
│                         │
│  We sent a code to      │
│  +233 XX XXX XXXX       │
│                         │
│                         │
│   ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐│
│   │ │ │ │ │ │ │ │ │ │ │ ││
│   └─┘ └─┘ └─┘ └─┘ └─┘ └─┘│
│                         │
│                         │
│  Didn't receive code?   │
│  [Resend] in 00:30      │
│                         │
│  ┌─────────────────┐    │
│  │     Verify      │    │
│  └─────────────────┘    │
│                         │
└─────────────────────────┘
```

### 3.3 Buyer Screens

#### Home Screen
```
┌─────────────────────────┐
│ 📍 Accra          🔔    │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🔍 Search properties│ │
│ └─────────────────────┘ │
│                         │
│ Categories              │
│ ┌────┐┌────┐┌────┐┌────┐│
│ │🏠  ││🏢  ││🏞️  ││🏪  ││
│ │House││Apt ││Land││Shop││
│ └────┘└────┘└────┘└────┘│
│                         │
│ Featured Properties  →  │
│ ┌─────────┐┌─────────┐  │
│ │ [Image] ││ [Image] │  │
│ │ Title   ││ Title   │  │
│ │ GHS XXX ││ GHS XXX │  │
│ └─────────┘└─────────┘  │
│                         │
│ Near You            →   │
│ ┌─────────────────────┐ │
│ │[Img]│ Title         │ │
│ │     │ Location      │ │
│ │     │ GHS 500,000  ❤│ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ 🏠    🔍    🗺    💬   👤│
│ Home Search Map  Chat  Me│
└─────────────────────────┘
```

#### Search Results Screen
```
┌─────────────────────────┐
│ ← Search Results   ⚙️ ≡ │
├─────────────────────────┤
│ Accra • Houses • Buy    │
│ 234 properties found    │
├─────────────────────────┤
│ [Filter] [Sort ▼] [Map] │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │[Img]│ 4 Bed House   │ │
│ │     │ 📍 East Legon │ │
│ │     │ GHS 850,000   │ │
│ │     │ 🛏4 🚿3      ❤│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │[Img]│ 3 Bed House   │ │
│ │     │ 📍 Tema       │ │
│ │     │ GHS 450,000   │ │
│ │     │ 🛏3 🚿2      ❤│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │[Img]│ 5 Bed Mansion │ │
│ │     │ 📍 Airport    │ │
│ │     │ GHS 1,200,000 │ │
│ │     │ 🛏5 🚿4      ❤│ │
│ └─────────────────────┘ │
│           ...           │
├─────────────────────────┤
│ 🏠    🔍    🗺    💬   👤│
└─────────────────────────┘
```

#### Filter Bottom Sheet
```
┌─────────────────────────┐
│         ───             │
│                         │
│ Filters           Reset │
├─────────────────────────┤
│ Property Type           │
│ [House][Apt][Land][All] │
│                         │
│ Transaction             │
│ [Buy] [Rent]            │
│                         │
│ Price Range (GHS)       │
│ Min ├────●────┤ Max     │
│ 0      500K    2M+      │
│                         │
│ Bedrooms                │
│ [Any][1][2][3][4][5+]   │
│                         │
│ Amenities               │
│ ☑ Water  ☑ Electricity  │
│ ☐ Security ☐ Parking    │
│ ☐ Internet ☐ Pool       │
│                         │
│ ┌─────────────────────┐ │
│ │ Show 234 Properties │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Property Detail Screen
```
┌─────────────────────────┐
│ ← Property     ↗️  ❤️    │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │                     │ │
│ │    [Main Image]     │ │
│ │                     │ │
│ │ ● ○ ○ ○ ○    1/15   │ │
│ └─────────────────────┘ │
│ [📷15] [🎥 3] [🔄360°] │
├─────────────────────────┤
│                         │
│ 4 Bedroom House         │
│ 📍 East Legon, Accra    │
│                         │
│ GHS 850,000        [Nego]│
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 🛏  │ │ 🚿  │ │ 📐  │ │
│ │  4  │ │  3  │ │2 Plt│ │
│ │Beds │ │Bath │ │Size │ │
│ └─────┘ └─────┘ └─────┘ │
│                         │
│ Description             │
│ Beautiful 4 bedroom     │
│ house located in the    │
│ heart of East Legon...  │
│ [Read More]             │
│                         │
│ Amenities               │
│ ✓Water ✓Electricity     │
│ ✓Security ✓Parking      │
│                         │
│ Location         [View] │
│ ┌─────────────────────┐ │
│ │    [Map Preview]    │ │
│ └─────────────────────┘ │
│                         │
│ Listed by               │
│ ┌─────────────────────┐ │
│ │[Ava]│ Kofi Mensah  ✓│ │
│ │     │ Member since  │ │
│ │     │ 2023         →│ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ ┌──────────┐┌──────────┐│
│ │ 📞 Call  ││ 💬 Chat  ││
│ └──────────┘└──────────┘│
└─────────────────────────┘
```

#### 360° Viewer Screen
```
┌─────────────────────────┐
│ ✕               🔄 Auto │
├─────────────────────────┤
│                         │
│                         │
│                         │
│    [360° Panorama       │
│     Interactive View]   │
│                         │
│     Drag to look        │
│       around            │
│                         │
│                         │
│                         │
├─────────────────────────┤
│      Living Room        │
│    ← Swipe for more →   │
└─────────────────────────┘
```

### 3.4 Owner Screens

#### Owner Dashboard
```
┌─────────────────────────┐
│ Hi, Kofi 👋        🔔   │
├─────────────────────────┤
│                         │
│ Your Stats              │
│ ┌─────────┐┌─────────┐  │
│ │   234   ││    12   │  │
│ │  Views  ││Inquiries│  │
│ └─────────┘└─────────┘  │
│ ┌─────────┐┌─────────┐  │
│ │    2    ││    1    │  │
│ │ Active  ││ Pending │  │
│ └─────────┘└─────────┘  │
│                         │
│ Subscription            │
│ ┌─────────────────────┐ │
│ │ Basic Plan          │ │
│ │ 1/2 listings used   │ │
│ │ Expires: Jan 15     │ │
│ │            [Renew] →│ │
│ └─────────────────────┘ │
│                         │
│ Recent Inquiries     →  │
│ ┌─────────────────────┐ │
│ │[Ava]│ Ama asked     │ │
│ │     │ about 4 Bed...│ │
│ │     │ 2 hours ago  →│ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  + Add New Listing  │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ 📊    🏠    ➕    💬   👤│
│Dash Listings Add Chat  Me│
└─────────────────────────┘
```

#### Create Listing - Step 1
```
┌─────────────────────────┐
│ ← New Listing           │
├─────────────────────────┤
│ Step 1 of 10            │
│ ━━━━━○○○○○○○○○○         │
│                         │
│ What type of property?  │
│                         │
│ ┌─────────────────────┐ │
│ │  🏠                 │ │
│ │  House              │ │
│ │                    ○│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  🏢                 │ │
│ │  Apartment          │ │
│ │                    ○│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  🏞️                 │ │
│ │  Land               │ │
│ │                    ○│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  🏪                 │ │
│ │  Commercial         │ │
│ │                    ○│ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │      Continue       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Create Listing - Photos
```
┌─────────────────────────┐
│ ← New Listing           │
├─────────────────────────┤
│ Step 6 of 10            │
│ ━━━━━━━━━━━━○○○○        │
│                         │
│ Add Photos              │
│ Minimum 5, Maximum 15   │
│                         │
│ ┌─────┐┌─────┐┌─────┐   │
│ │[img]││[img]││[img]│   │
│ │  ✕  ││  ✕  ││  ✕  │   │
│ └─────┘└─────┘└─────┘   │
│ ┌─────┐┌─────┐┌─────┐   │
│ │[img]││[img]││ ┌─┐ │   │
│ │  ✕  ││  ✕  ││ │+│ │   │
│ └─────┘└─────┘│ └─┘ │   │
│               │ Add │   │
│               └─────┘   │
│                         │
│ 5/15 photos added       │
│ Drag to reorder         │
│                         │
│ 💡 Tips:                │
│ • Use good lighting     │
│ • Show all rooms        │
│ • Include exterior      │
│                         │
│ ┌─────────────────────┐ │
│ │      Continue       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Create Listing - Location
```
┌─────────────────────────┐
│ ← New Listing           │
├─────────────────────────┤
│ Step 9 of 10            │
│ ━━━━━━━━━━━━━━━━━━○     │
│                         │
│ Set Location            │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │    [Map View]       │ │
│ │                     │ │
│ │        📍           │ │
│ │    (Draggable)      │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🎯 Use My Location  │ │
│ └─────────────────────┘ │
│                         │
│ Address (auto-filled)   │
│ ┌─────────────────────┐ │
│ │ 123 Example Street  │ │
│ │ East Legon, Accra   │ │
│ └─────────────────────┘ │
│                         │
│ ⚠️ Drag pin to exact   │
│    property location    │
│                         │
│ ┌─────────────────────┐ │
│ │   Confirm Location  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 3.5 Chat Screen

```
┌─────────────────────────┐
│ ← Ama Serwaa    📞  ⋮   │
│   About: 4 Bed House    │
├─────────────────────────┤
│                         │
│        Jan 15, 2024     │
│                         │
│ ┌─────────────────┐     │
│ │ Hello, is this  │     │
│ │ property still  │     │
│ │ available?      │     │
│ └─────────────────┘     │
│                   10:30 │
│                         │
│     ┌─────────────────┐ │
│     │ Yes, it is!     │ │
│     │ Would you like  │ │
│     │ to schedule a   │ │
│     │ visit?          │ │
│     └─────────────────┘ │
│ 10:32 ✓✓                │
│                         │
│ ┌─────────────────┐     │
│ │ Yes please. Is  │     │
│ │ Saturday good?  │     │
│ └─────────────────┘     │
│                   10:35 │
│                         │
├─────────────────────────┤
│ ┌─────────────────┐ 📎  │
│ │ Type message... │ ▶️  │
│ └─────────────────┘     │
└─────────────────────────┘
```

### 3.6 Subscription Screen

```
┌─────────────────────────┐
│ ← Choose Plan           │
├─────────────────────────┤
│                         │
│ Unlock Full Access      │
│                         │
│ ┌─────────────────────┐ │
│ │      BASIC          │ │
│ │                     │ │
│ │    GHS 30/month     │ │
│ │                     │ │
│ │ ✓ Full property     │ │
│ │   details           │ │
│ │ ✓ 2 owner contacts  │ │
│ │ ✓ 30 days access    │ │
│ │                     │ │
│ │     [Select]        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   ⭐ STANDARD       │ │
│ │      POPULAR        │ │
│ │    GHS 50/month     │ │
│ │                     │ │
│ │ ✓ Everything in     │ │
│ │   Basic             │ │
│ │ ✓ Saved searches    │ │
│ │ ✓ 60 days access    │ │
│ │                     │ │
│ │     [Select]        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │     💎 PREMIUM      │ │
│ │                     │ │
│ │    GHS 70/month     │ │
│ │                     │
│ │ ✓ Everything in     │ │
│ │   Standard          │ │
│ │ ✓ Early notifs      │ │
│ │ ✓ 90 days access    │ │
│ │                     │ │
│ │     [Select]        │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

---

## 4. Interaction Specifications

### 4.1 Gestures

| Gesture | Action |
|---------|--------|
| Tap | Select, navigate, toggle |
| Long Press | Context menu, drag to reorder |
| Swipe Left/Right | Image carousel, dismiss |
| Swipe Down | Pull to refresh, dismiss modal |
| Pinch | Zoom images, map |
| Double Tap | Zoom in, like (images) |
| Drag | Move map pin, reorder items |

### 4.2 Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Screen Transition | Slide Right | 300ms |
| Modal | Slide Up | 250ms |
| Button Press | Scale 0.95 | 100ms |
| Heart/Save | Scale + Color | 200ms |
| Loading | Pulse/Shimmer | Continuous |
| Success | Checkmark Draw | 400ms |
| Tab Switch | Fade + Slide | 200ms |

### 4.3 Loading States

**Skeleton Screens:**
- Use gray shimmer placeholders
- Match layout of actual content
- Show immediately, no spinner

**Button Loading:**
- Replace text with spinner
- Disable button
- Keep same width

**Pull to Refresh:**
- Custom branded spinner
- Max pull distance: 100px

### 4.4 Empty States

```
┌─────────────────────────┐
│                         │
│     [Illustration]      │
│                         │
│    No Properties Yet    │
│                         │
│  Properties you save    │
│  will appear here       │
│                         │
│   [Browse Properties]   │
│                         │
└─────────────────────────┘
```

### 4.5 Error States

```
┌─────────────────────────┐
│                         │
│     [Error Illust]      │
│                         │
│   Something went wrong  │
│                         │
│  We couldn't load the   │
│  properties. Please     │
│  try again.             │
│                         │
│      [Try Again]        │
│                         │
└─────────────────────────┘
```

---

## 5. Accessibility Guidelines

### 5.1 Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

### 5.2 Touch Targets
- Minimum size: 44x44 points
- Spacing between targets: 8px minimum

### 5.3 Text
- Minimum font size: 12px
- Support dynamic type scaling
- Maximum line length: 60-80 characters

### 5.4 Screen Reader
- All images have alt text
- Buttons have descriptive labels
- Form inputs have associated labels
- Logical reading order

---

## 6. Design Deliverables Checklist

### Phase 1: Research & Planning
- [ ] Competitive analysis
- [ ] User personas (3)
- [ ] User journey maps
- [ ] Information architecture
- [ ] Sitemap

### Phase 2: Wireframes
- [ ] Low-fidelity wireframes (all screens)
- [ ] User flow diagrams
- [ ] Interaction notes

### Phase 3: Visual Design
- [ ] Style guide / Design system
- [ ] High-fidelity designs (all screens)
- [ ] Light mode designs
- [ ] Dark mode designs
- [ ] Responsive considerations

### Phase 4: Prototype
- [ ] Interactive prototype (Figma)
- [ ] Key user flows demonstrated
- [ ] Micro-interactions defined

### Phase 5: Handoff
- [ ] Developer specifications
- [ ] Asset exports (PNG, SVG)
- [ ] Icon library
- [ ] Animation specifications
- [ ] Component documentation

---

## 7. Screen Inventory

### Total Screens: 45+

| Category | Screens | Priority |
|----------|---------|----------|
| Onboarding | 5 | P1 |
| Authentication | 6 | P1 |
| Buyer Home & Search | 8 | P1 |
| Property Details | 4 | P1 |
| Map Views | 3 | P1 |
| Owner Dashboard | 4 | P1 |
| Create Listing | 10 | P1 |
| Chat/Messaging | 3 | P2 |
| Subscription/Payment | 4 | P1 |
| Profile/Settings | 5 | P2 |
| Admin Panel | 8+ | P2 |

---

*Document Version: 1.0*
*Last Updated: December 2024* │