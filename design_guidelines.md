# Design Guidelines: Hope Street Health Medication Lookup Tool

## Design Approach
**Utility-First Medical Interface** - This is a critical healthcare tool requiring maximum clarity and accessibility. Drawing inspiration from **government health portals (Medicare.gov, CDC.gov)** and **medical information sites (WebMD, Mayo Clinic)** - prioritize information hierarchy, readability, and trust signals over visual flair.

## Color System (As Specified in PRD)
- **Primary Blue**: #2C5F8D (headers, links, trust elements)
- **Warning Red**: #C41E3A (warnings section background and text)
- **Success Green**: #2D7D46 (safe information indicators)
- **Background**: #F5F5F5 (main page background)
- **White**: #FFFFFF (card backgrounds)
- **Text**: #1A1A1A (primary text, high contrast)
- **Text Secondary**: #4A4A4A (supporting text)

## Typography
- **Font Family**: System font stack (Arial, Helvetica, sans-serif)
- **Headings**: 24-32px, bold weight
- **Body Text**: 16-18px, regular weight
- **Warnings**: 16px, bold weight
- **Minimum mobile font size**: 16px (prevents zoom on iOS)

## Layout & Spacing
- **Container max-width**: 800px (optimal reading width)
- **Card padding**: p-5 (20px all sides)
- **Section spacing**: space-y-4 (16px vertical rhythm)
- **Touch targets**: Minimum 44px × 44px (WCAG AAA)
- **Responsive breakpoints**: 
  - Mobile: 320px-767px (single column, full-width elements)
  - Tablet: 768px-1023px (increased padding)
  - Desktop: 1024px+ (centered layout with max-width)

## Component Structure

**Header**
- Site title: "Hope Street Health - Medication Lookup" (text-2xl font-bold)
- Subtitle: "Quick medication information for patients and staff" (text-gray-600)
- Centered alignment, py-6 padding

**Search Section**
- Large search input (h-12 minimum, w-full on mobile)
- Placeholder: "Type medication name..."
- Search icon (magnifying glass) positioned left inside input
- Example text below: "Try searching: Lisinopril, Metformin, or Zoloft" (text-sm text-gray-600)
- Real-time filtering as user types

**Medication Card (Results Display)**
- White background with subtle shadow (shadow-md)
- Rounded corners (rounded-lg)
- Information sections with emoji icons for visual scanning:
  - 📌 Generic Name (text-2xl font-bold, primary blue)
  - 🏷️ Brand Names (text-base, gray-700)
  - ✅ Primary Use (text-lg, with green indicator)
  - 💊 How to Take (text-base)
  - ⚠️ Warnings (bg-red-50, border-l-4 border-red-500, p-4, font-bold)
  - 📋 Common Side Effects (text-base, gray-700)
- Each section separated by border-b or space-y-3
- "Search Again" button at bottom (full-width on mobile, px-8 on desktop, h-12)

**Empty/Error States**
- "No medication found" message (text-center, text-gray-600)
- Helpful suggestion: "Try one of these common medications:" 
- Clickable list of all 10 available medications (buttons with hover states)

## Accessibility Requirements
- High contrast ratios (minimum 7:1 for text)
- Focus indicators on all interactive elements (ring-2 ring-blue-500)
- Semantic HTML (proper heading hierarchy h1→h2→h3)
- ARIA labels for search functionality
- Keyboard navigation support (Tab, Enter keys)
- Screen reader friendly medication information structure

## Mobile-Specific Optimizations
- Search input auto-focuses on page load (mobile)
- Full-width buttons (w-full on mobile, auto on desktop)
- Sticky search bar option for long medication cards
- No horizontal scrolling
- Tap targets never closer than 8px apart

## Images
**No hero image needed** - This is a utility tool where users need immediate access to search functionality. The interface should open directly to the search input without any marketing imagery or hero sections.