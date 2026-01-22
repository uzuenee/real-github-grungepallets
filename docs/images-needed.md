# Image Assets Needed for Grunge Pallets Website

This document lists all the images needed across the website (excluding product images which are managed through the admin panel).

---

## 1. HERO SECTION BACKGROUND
**Location:** `src/components/sections/Hero.tsx`  
**Current State:** CSS gradient background (no image)  
**File Name:** `hero-background.jpg`  
**Dimensions:** 1920x1080px minimum (will be used as background-cover)  
**Prompt:**
> Industrial warehouse with wooden pallets stacked high, dramatic lighting with amber/orange sun rays coming through large warehouse windows, forklift in motion blur in background, professional industrial photography style, warm earthy tones, dust particles visible in light beams, wide angle shot, commercial photography quality

---

## 2. ABOUT PAGE - COMPANY IMAGE
**Location:** `src/components/sections/AboutContent.tsx` (line 58-65)  
**Current State:** Package icon placeholder  
**File Name:** `about-company.jpg`  
**Dimensions:** 800x600px (4:3 aspect ratio)  
**Prompt:**
> Team of warehouse workers in safety vests and hard hats standing proudly in front of organized stacks of wooden pallets, friendly and professional atmosphere, industrial setting, natural lighting, diverse team of 4-5 workers, some holding clipboards, forklift in background, professional corporate photography

---

## 3. TRUST LOGOS / PARTNER LOGOS (Currently Hidden)
**Location:** `src/components/sections/TrustLogos.tsx`  
**Current State:** Hidden (placeholder boxes with "Partner 1-6")  
**Note:** These should be actual client/partner logos, not AI-generated. Skip this for now until you have real partner logos.

---

## 4. BLOG/RESOURCES - ARTICLE HEADER IMAGES
**Location:** `src/components/ui/ArticleCard.tsx`, individual article pages  
**Current State:** Gradient color placeholders with icons  

### 4a. Pallet Grades Explained
**File Name:** `article-pallet-grades.jpg`  
**Dimensions:** 1200x630px (16:9)  
**Prompt:**
> Close-up comparison of three wooden pallets side by side showing different quality grades - new/pristine on left, lightly used in middle, recycled/well-worn on right, shot from above at slight angle, clean white warehouse floor, professional product photography with soft studio lighting, educational infographic style

### 4b. Recycling Benefits
**File Name:** `article-recycling-benefits.jpg`  
**Dimensions:** 1200x630px (16:9)  
**Prompt:**
> Pile of old wooden pallets being sorted by workers in a recycling facility, green sustainability theme, natural light, eco-friendly industrial setting, recycling symbols visible, wood chips and sawdust in foreground, trees visible through window in background suggesting environmental connection

### 4c. Choosing the Right Pallet
**File Name:** `article-choosing-pallet.jpg`  
**Dimensions:** 1200x630px (16:9)  
**Prompt:**
> Business person in casual corporate attire examining a wooden pallet with tablet in hand, warehouse setting with various pallet types in background, decision-making concept, professional lighting, clean and organized environment, measuring tape visible

### 4d. Sustainability Report
**File Name:** `article-sustainability.jpg`  
**Dimensions:** 1200x630px (16:9)  
**Prompt:**
> Aerial drone view of a sustainable pallet yard with organized pallet stacks, green trees surrounding the facility, solar panels on warehouse roof, nature meeting industry, environmental photography style, morning golden hour lighting, emphasizing harmony between business and nature

---

## 5. SERVICES PAGE - SERVICE CARDS (Optional Enhancement)
**Location:** `src/components/sections/ServicesGrid.tsx`  
**Current State:** Icon-based (Package, Recycle, Truck icons)  
**Note:** The current icon-based design works well. Optional image additions below.

### 5a. Pallet Supply Service
**File Name:** `service-pallet-supply.jpg`  
**Dimensions:** 600x400px  
**Prompt:**
> Fresh stack of Grade A wooden pallets in a clean warehouse, shrink-wrapped and ready for delivery, professional product shot, clean industrial background, pallets prominently featured and well-lit

### 5b. Pallet Removal Service
**File Name:** `service-pallet-removal.jpg`  
**Dimensions:** 600x400px  
**Prompt:**
> Worker loading old pallets onto a flatbed truck with forklift, action shot, industrial yard setting, efficient operation in progress, professional uniform with company branding potential

### 5c. Logistics / Drop Trailer Service
**File Name:** `service-logistics.jpg`  
**Dimensions:** 600x400px  
**Prompt:**
> 53-foot drop trailer parked at warehouse loading dock, pallets visible inside open trailer doors, professional trucking and logistics scene, clean modern logistics facility, golden hour lighting

---

## 6. PAGE HERO BACKGROUNDS (Optional)
**Location:** `src/components/sections/PageHero.tsx`  
**Current State:** CSS gradient  
**Note:** Could add subtle background patterns or images to enhance page headers.

### 6a. Services Page Header
**File Name:** `hero-services.jpg`  
**Dimensions:** 1920x600px  
**Prompt:**
> Wide panoramic shot of clean warehouse interior with organized pallet racks, forklifts, and workers in motion, blue-tinted industrial atmosphere, professional logistics setting, subtle blur for text overlay use

### 6b. About Page Header  
**File Name:** `hero-about.jpg`  
**Dimensions:** 1920x600px  
**Prompt:**
> Aerial view of pallet warehouse yard at sunset, organized rows of pallets, trucks and forklifts, warm golden lighting, professional commercial photography, showing scale of operation

### 6c. Contact Page Header
**File Name:** `hero-contact.jpg`  
**Dimensions:** 1920x600px  
**Prompt:**
> Friendly customer service representative in industrial setting, desk with computer visible, warehouse in background, welcoming and professional atmosphere, warm lighting

---

## 7. 404/ERROR PAGE
**Location:** `src/app/not-found.tsx`  
**Current State:** No image  
**File Name:** `404-illustration.jpg`  
**Dimensions:** 600x400px  
**Prompt:**
> Humorous illustration of a wooden pallet with a GPS device showing "lost" or confused face, cartoon style with warm industrial colors, playful but professional, simple clean background

---

## PRIORITY ORDER FOR IMPLEMENTATION

### High Priority (Most Visible):
1. **Hero Background** - First thing visitors see
2. **About Company Image** - Important for trust/credibility

### Medium Priority:
3. **Article Header Images** (4 images) - Enhances blog content

### Low Priority (Nice to Have):
4. Service Images - Icons work fine
5. Page Hero Backgrounds - Gradients work fine
6. 404 Illustration - Rarely seen

---

## IMAGE SPECIFICATIONS

| Attribute | Recommendation |
|-----------|----------------|
| Format | JPG for photos, PNG for graphics with transparency |
| Quality | 80-85% compression for web optimization |
| Color Profile | sRGB |
| Max File Size | Under 500KB per image after compression |

---

## UPLOAD LOCATIONS

All images should be placed in: `public/images/`

Example structure:
```
public/
├── images/
│   ├── hero-background.jpg
│   ├── about-company.jpg
│   ├── articles/
│   │   ├── pallet-grades.jpg
│   │   ├── recycling-benefits.jpg
│   │   ├── choosing-pallet.jpg
│   │   └── sustainability.jpg
│   └── services/
│       ├── pallet-supply.jpg
│       ├── pallet-removal.jpg
│       └── logistics.jpg
└── logo.jpg (already exists)
```
