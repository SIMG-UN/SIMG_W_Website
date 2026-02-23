# 🧠 SIMG - Semillero de Investigación en Modelos Generativos

<div align="center">

![SIMG Banner](public/images/website/SIMG_LOGO.jpg)

**Research Seminar on Generative Models**  
Universidad Nacional de Colombia

[🌐 Website](https://simg-website.vercel.app) • [📚 Research](https://simg-website.vercel.app/en/research) • [👥 Team](https://simg-website.vercel.app/en/members) • [📧 Contact](https://simg-website.vercel.app/en/contact)

</div>

---

## 📖 About

The **SIMG** (Semillero de Investigación en Modelos Generativos) is a research seminar affiliated with the **Universidad Nacional de Colombia - UNAL**, dedicated to advancing the frontiers of artificial intelligence through rigorous research and collaborative innovation.

Our mission is to create a dynamic learning environment that introduces students to cutting-edge AI research, focusing on:

- 🔤 **Natural Language Processing (NLP)**
- 🧠 **Long Short-Term Memory (LSTM) Networks**
- ⚡ **Transformers & Attention Mechanisms**
- 🤖 **Autonomous AI Agents**
- 📊 **Benchmarks & Model Fine-tuning**
- 🎨 **Diffusion Models**

---

## 🎨 Design System

This website features a modern design with:

- **Color Palette**: Orange primary (#f97316), Blue secondary (#0ea5e9)
- **Visual Effects**: Glassmorphism, radial gradients, smooth animations
- **Theme Support**: Dark/Light mode with persistent storage
- **Typography**: Responsive, clamp-based sizing with system fonts
- **Components**: Reusable design tokens and CSS custom properties

---

## 🚀 Tech Stack

- **[Astro 5.14.8](https://astro.build)** - Static Site Generator
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[EmailJS](https://www.emailjs.com/)** - Client-side email service for contact form
- **CSS Custom Properties** - Comprehensive design token system
- **Content Collections** - Markdown-based content management
- **Node.js v24.11.0** - Runtime environment

---

## 📁 Project Structure

```text
SIMG_W_Website/
├── public/
│   ├── images/
│   │   ├── events/           # Auto-generated event thumbnails (SVG/PNG)
│   │   ├── members/          # Team member photos
│   │   ├── research/         # Research project images
│   │   └── website/          # Site logos and assets
│   └── favicon.svg
├── scripts/
│   ├── create-event.mjs      # CLI tool to create new events
│   └── generate-thumbnail.mjs # Thumbnail generator (Nano Banana / SVG fallback)
├── .github/
│   └── workflows/
│       └── create-event.yml  # CI/CD: create events via GitHub Actions
├── src/
│   ├── components/
│   │   ├── Header.astro      # Navigation with theme toggle
│   │   ├── EventCard.astro   # Reusable event card with share/calendar/resources
│   │   ├── Footer.astro
│   │   └── SponsorCarousel.astro
│   ├── content/
│   │   ├── config.ts         # Content Collections config (members, blog, research, events)
│   │   ├── events/           # 📅 Event content (en/es)
│   │   │   ├── en/           # English event markdown files
│   │   │   └── es/           # Spanish event markdown files
│   │   ├── members/          # Team member profiles (en/es)
│   │   ├── research/         # Research projects (en/es)
│   │   └── blog/             # Blog posts (en/es)
│   ├── layouts/
│   │   └── Layout.astro      # Base layout with FOUC prevention
│   ├── pages/
│   │   ├── en/
│   │   │   ├── index.astro
│   │   │   ├── about.astro
│   │   │   ├── events.astro   # 📅 Unified Events page (EN)
│   │   │   ├── research.astro
│   │   │   ├── members.astro
│   │   │   └── contact.astro
│   │   ├── es/
│   │   │   ├── events.astro   # 📅 Unified Events page (ES)
│   │   │   └── ...
│   │   └── index.astro       # Language redirect
│   └── styles/
│       └── global.css        # Design tokens & global styles
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── CHANGELOG.md
```

---

## 🧞 Commands

Run from the project root:

| Command                       | Action                                              |
| :---------------------------- | :-------------------------------------------------- |
| `bun install`                 | Install dependencies                                |
| `bun run dev`                 | Start dev server at `localhost:4321`                |
| `bun run build`               | Build production site to `./dist/`                  |
| `bun run preview`             | Preview build locally before deploying              |
| `bun run astro ...`           | Run Astro CLI commands                              |
| `bun run new-event`           | 📅 Interactive CLI to create a new event            |
| `bun run generate-thumbnails` | 🎨 Generate thumbnails for all events               |

---

## 🌐 Pages

### 1. **Home** (`/`)

- Auto-redirects to preferred language (en/es)
- Hero section with gradient backgrounds
- Featured research preview
- Call-to-action sections

### 2. **About Us** (`/about`)

- Mission statement
- Research focus areas with interactive cards
- Team introduction

### 3. **Research** (`/research`)

- Filterable research projects grid
- Search functionality
- Category-based organization (Research, Products, Partnerships)

### 4. **Members** (`/members`)

- Team profiles with photos
- Research interests and links
- Alumni section

### 5. **Contact** (`/contact`)

- **Email Contact Form** powered by [EmailJS](https://www.emailjs.com/)
  - Sends emails directly from the browser without a backend server
  - Messages are sent to: `alesanchezpov@gmail.com` and `robertgomez.datascience@gmail.com`
  - Includes sender's name, email, subject, and message
  - Real-time validation and loading states
  - Success/error feedback with styled notifications
  - Free tier: 200 emails/month
- Contact information (location, emails, meeting times)
- Interactive Google Maps integration showing Building 404 - Yu Takeuchi location
- Social media links

### 6. **Events** (`/events`) — *Unified Events Page*

The Events page replaces the old separate `in-person.astro` and `recordings.astro` pages, merging all session content into a single, feature-rich page.

- **Hero Section** with Google Maps embed (Building 404 Yu Takeuchi)
  - Recurring Google Calendar link (every Friday 2–4 PM COT)
  - Get Directions button
  - Location details with room number
- **Upcoming Events** grid (auto-filtered by `status: upcoming`, **limited to 3 most recent**)
- **Past Events** grid (auto-filtered by `status: completed`, **limited to 3 latest**)
- **YouTube Recordings** section (fetches latest **3 videos** via YouTube Data API v3)
- **Session Guidelines** cards (open to all, bring laptop, Python basics, ask questions)

**📊 Event Display Limits**: All sections consistently show **maximum 3 items** for clean grid layout.

**Event Cards** (`EventCard.astro`) feature:
- Thumbnail display (16:9 ratio) with lazy loading
- Event type badges: 🔵 In-Person, 🟢 Virtual, 🟡 Hybrid
- Status badges: 🟡 Upcoming, 🔴 Live (pulsing), ⚪ Completed
- Google Calendar URL auto-generation from event date/time/location
- Share buttons: WhatsApp, LinkedIn, Copy Link (clipboard API)
- Resource links, recording link, meeting link
- Light/Dark mode support
- Duration badge

**Grid Layout**: Up to 3 cards per row on desktop, 1 column on mobile

#### EmailJS Configuration

The contact form uses EmailJS to send emails without requiring a backend server. Here's how it works:

1. **Service Setup**: Connected to Gmail account (`alesanchezpov@gmail.com`)
2. **Email Template**: Custom HTML template with SIMG branding
3. **Recipients**: 
   - Primary: `alesanchezpov@gmail.com`
   - Bcc: `robertgomez.datascience@gmail.com`
4. **Reply-To**: Automatically set to the sender's email from the form

**Required Configuration**:
- `EMAILJS_PUBLIC_KEY`: Your EmailJS public key
- `EMAILJS_SERVICE_ID`: Gmail service ID
- `EMAILJS_TEMPLATE_ID`: Contact form template ID

These values are configured in both `/en/contact.astro` and `/es/contact.astro`.

#### YouTube Data API Configuration

The session recordings page uses YouTube Data API v3 to fetch and display videos from the SIMG channel. Here's how it works:

1. **API Setup**: Fetches latest videos from `@simg-UN` YouTube channel
2. **Video Data Retrieved**: 
   - Video thumbnails (high quality)
   - Title and description
   - Publication date
   - Video duration
   - Video ID for direct YouTube links
3. **Display Features**:
   - Automatic grid layout (3 videos)
   - Click-to-watch on YouTube
   - Styled with Van Gogh palette
   - Fallback error messages if API fails

**Required Configuration**:
- `PUBLIC_YOUTUBE_API_KEY`: Your YouTube Data API v3 key
- `PUBLIC_YOUTUBE_CHANNEL_ID`: SIMG YouTube channel ID

These values are configured in both `/en/sessions/recordings.astro` and `/es/sessions/recordings.astro`.

---

## 📅 Events System

The Events system is the core feature for managing SIMG session content. It uses Astro Content Collections with a comprehensive Zod schema to validate event data.

### How to Add an Event

There are **3 ways** to create a new event:

#### Option 1: Interactive CLI (Recommended)

```bash
bun run new-event
```

This launches an interactive prompt that asks for:
- Title (EN + ES), description, date, time, speaker
- Event type (in-person / virtual / hybrid)
- Location details, meeting links, tags
- Body content in markdown
- Optional thumbnail generation

It automatically creates both EN and ES markdown files.

#### Option 2: Manual Markdown

Create a new `.md` file in both `src/content/events/en/` and `src/content/events/es/`:

```markdown
---
title: "Your Event Title"
description: "Short description of the event"
date: 2026-04-01
time: "2:00 PM - 4:00 PM"
speaker: "SIMG Research Group"
eventType: "in-person"
location: "Universidad Nacional de Colombia, Bogotá"
building: "404 - Yu Takeuchi"
room: "202-405"
meetingLink: ""
meetingPlatform: ""
googleCalendarLink: ""
recurrent: false
thumbnail: "/images/events/your-event-slug.svg"
banner: ""
resources: []
recordingUrl: ""
tags: ["AI", "Research"]
status: "upcoming"
lang: "en"
translationKey: "your-event-slug"
participants: []
duration: "1h 30m"
---

Your event description in markdown format here.
```

Then generate the thumbnail:
```bash
node scripts/generate-thumbnail.mjs --title "Your Event Title" --date "2026-04-01" --type "in-person"
```

#### Option 3: GitHub Actions (CI/CD)

Go to **Actions** → **Create Event** → **Run workflow** and fill in the form fields. This automatically:
1. Creates EN + ES markdown files
2. Generates a thumbnail
3. Opens a Pull Request with the new event

### Event Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Event title |
| `description` | string | ✅ | Short description |
| `date` | date | ✅ | Event date |
| `time` | string | ✅ | Time range (e.g., "2:00 PM - 4:00 PM") |
| `speaker` | string | ✅ | Speaker or group name |
| `eventType` | enum | ✅ | `in-person`, `virtual`, or `hybrid` |
| `location` | string | ❌ | Venue name |
| `building` | string | ❌ | Building name/number |
| `room` | string | ❌ | Room number |
| `meetingLink` | string | ❌ | URL for virtual events |
| `meetingPlatform` | string | ❌ | Platform name (Google Meet, Zoom, etc.) |
| `thumbnail` | string | ❌ | Path to thumbnail image |
| `resources` | array | ❌ | Array of `{ title, url, type }` objects |
| `recordingUrl` | string | ❌ | YouTube/recording URL |
| `tags` | string[] | ❌ | Topic tags |
| `status` | enum | ✅ | `upcoming`, `live`, `completed`, or `cancelled` |
| `lang` | string | ✅ | `en` or `es` |
| `translationKey` | string | ✅ | Matches EN/ES counterparts |
| `duration` | string | ❌ | Duration text (e.g., "1h 30m") |

### Thumbnail Generation

The thumbnail generator (`scripts/generate-thumbnail.mjs`) supports two modes:

1. **AI Generation** (Nano Banana): If `BANANA_API_KEY` and `BANANA_MODEL_KEY` environment variables are set, it generates AI-powered thumbnails via Banana.dev
2. **SVG Fallback**: Creates branded SVG thumbnails with SIMG colors (Yellow #F4C542 + Blue #2E6DB4), event title, date, type badge, and turtle icon

```bash
# Generate for a single event
node scripts/generate-thumbnail.mjs --title "GPU Programming" --date "2026-02-27" --type "in-person"

# Generate for all events
bun run generate-thumbnails
```

### Updating Event Status

To mark an event as completed (e.g., after the session):
1. Open the event's `.md` file (both EN and ES)
2. Change `status: "upcoming"` to `status: "completed"`
3. Optionally add `recordingUrl: "https://youtube.com/watch?v=..."` with the recording link

---

## 🧪 Testing & Debugging

The project includes several testing scripts to verify that all components are working correctly.

### YouTube Integration Testing

**Test YouTube API and Channel Connection:**
```bash
# Test if YouTube API can fetch videos from your channel
node scripts/test-youtube.mjs
```

**Expected Output:**
- ✅ Environment variables loaded correctly
- ✅ API key validation successful  
- ✅ Channel found with video count
- ✅ Video list with titles, dates, and durations

**Common Issues:**
- `❌ API Key Error: API key not valid` → Check your `PUBLIC_YOUTUBE_API_KEY`
- `❌ No videos found` → Channel may be private or have no public videos
- `❌ Channel ID Error` → Verify `PUBLIC_YOUTUBE_CHANNEL_ID` is correct

**Helper Script - Find Channel ID:**
```bash
# Automatically find your channel ID using your API key
node scripts/get-youtube-channel-id.mjs YOUR_API_KEY
```

### EmailJS Testing

**Test Contact Form Integration:**

1. **Local Testing:**
   ```bash
   bun run dev
   # Navigate to: http://localhost:4321/en/contact
   # Fill and submit the contact form
   ```

2. **Environment Variables Check:**
   ```bash
   # Verify all EmailJS variables are set
   cat .env | grep EMAILJS
   ```

**Expected Behavior:**
- ✅ Form submits without errors
- ✅ Success message displays  
- ✅ Email arrives at `alesanchezpov@gmail.com`
- ✅ BCC copy sent to `robertgomez.datascience@gmail.com`
- ✅ Reply-To field set to sender's email

### Build & Content Validation

**Test Complete Build Process:**
```bash
# Verify all pages build successfully
bun run build

# Expected: "36 page(s) built" with no errors
```

**Test Event System:**
```bash
# Test event creation CLI
bun run new-event

# Test thumbnail generation
bun run generate-thumbnails
```

**Content Collections Validation:**
```bash
# Check for schema errors in events, members, research, blog
bun run build 2>&1 | grep -i error
```

### Thumbnail System Testing

**Test Thumbnail Generation:**
```bash
# Generate thumbnails for all events
node scripts/generate-thumbnail.mjs --all

# Generate thumbnail for specific event
node scripts/generate-thumbnail.mjs --title "Test Event" --date "2026-04-01" --type "in-person"
```

**Verify Thumbnails Load:**
```bash
# Check thumbnail files exist
ls -la public/images/events/

# Test thumbnail accessibility in dev server
curl -I http://localhost:4321/images/events/gpu-programming-model.svg
# Expected: HTTP/1.1 200 OK
```

### Page-Specific Tests

**Test Events Page:**
```bash
# Visit events page and verify:
# - Map loads correctly
# - Events display in grid (max 3 each section)
# - YouTube videos appear
# - Event cards have thumbnails
open http://localhost:4321/en/events
```

**Test Internationalization:**
```bash
# Verify both languages work
open http://localhost:4321/en/events
open http://localhost:4321/es/events
```

### Environment Variables Checklist

**Required Variables Check:**
```bash
# Run this to verify all required env vars are set:
echo "=== YouTube API ==="
echo "API Key: ${PUBLIC_YOUTUBE_API_KEY:0:20}..."
echo "Channel ID: ${PUBLIC_YOUTUBE_CHANNEL_ID}"
echo ""
echo "=== EmailJS ==="  
echo "Public Key: ${PUBLIC_EMAILJS_PUBLIC_KEY:0:15}..."
echo "Service ID: ${PUBLIC_EMAILJS_SERVICE_ID}"
echo "Template ID: ${PUBLIC_EMAILJS_TEMPLATE_ID}"
```

**Production Deployment Test:**
1. **Vercel Environment Variables:**
   - Go to Vercel Project → Settings → Environment Variables
   - Verify all `PUBLIC_*` variables match your local `.env`
   - Redeploy: `vercel --prod`

2. **Live Site Verification:**
   ```bash
   # Test production YouTube integration
   curl -s "https://simg-website.vercel.app/en/events" | grep -o 'video-card'
   
   # Test contact form on live site
   open https://simg-website.vercel.app/en/contact
   ```

### Development Workflow Testing

**New Event Creation Flow:**
1. Run `bun run new-event`
2. Fill out event details
3. Verify files created in `src/content/events/en/` and `src/content/events/es/`
4. Check thumbnail generated in `public/images/events/`
5. Run `bun run dev` and visit `/en/events`
6. Confirm new event appears in grid

**CI/CD Testing (GitHub Actions):**
1. Go to GitHub → Actions → "Create Event"
2. Run workflow with test data
3. Verify PR is created with new event files
4. Check that build passes in PR

### Performance & Accessibility

**Lighthouse Testing:**
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Test key pages
lighthouse http://localhost:4321/en/events --only-categories=performance,accessibility --chrome-flags="--headless"
lighthouse http://localhost:4321/es/events --only-categories=performance,accessibility --chrome-flags="--headless"
```

**Expected Scores:**
- Performance: >90
- Accessibility: >95

### Debugging Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| **YouTube videos not loading** | "Loading videos..." persists | Check API key and channel ID in `.env` |
| **Contact form fails** | Form submits but no email received | Verify EmailJS service ID and template ID |
| **Thumbnails broken** | Gray/missing thumbnails | Run `node scripts/generate-thumbnail.mjs --all` |
| **Build fails** | Astro build errors | Check content collection schema in `config.ts` |
| **Events not appearing** | Empty events grid | Verify event status is "upcoming" or "completed" |
| **Dark/light mode broken** | Theme doesn't persist | Check localStorage in browser devtools |

### Quick Health Check Script

Create a comprehensive test with one command:

```bash
# Add this to package.json scripts:
"test": "node scripts/test-youtube.mjs && bun run build && echo '✅ All systems operational!'"

# Run full health check:
bun run test
```

---

### Design System

- **600+ lines** of comprehensive CSS custom properties
- **Light/Dark Mode** with localStorage persistence
- **FOUC Prevention** via inline script in `<head>`
- **Glassmorphism** effects throughout
- **Responsive** design with mobile-first approach

### Color Identity

- Primary: Orange (#f97316, #ea580c)
- Secondary: Blue (#0ea5e9, #8b5cf6)
- Gradients: 50/50 orange-blue in text, orange-dominant in backgrounds

### Interactive Elements

- Theme toggle button (sun/moon icons)
- Language selector with hover dropdown
- Smooth scroll animations
- Hover effects with orange accents
- **Contact Form Integration**:
  - Client-side email delivery via EmailJS
  - No backend required
  - Form validation and error handling
  - Loading states and user feedback

---

## 🌍 Internationalization

The website supports both **English** and **Spanish** with:
- Parallel page structure (`/en/` and `/es/`)
- Automatic language detection from browser
- Manual language switching via header dropdown
- Bilingual content collections

---

## 📧 Contact Form Setup

The contact form uses **EmailJS** to send emails directly from the browser without a backend server.

### Setup Instructions

1. **Create EmailJS Account**
   - Visit [emailjs.com](https://www.emailjs.com/)
   - Sign up for free (200 emails/month)

2. **Configure Email Service**
   - Add Gmail service
   - Connect with `alesanchezpov@gmail.com`

3. **Create Email Template**
   - Template ID: Save this for step 4
   - Subject: `Nuevo mensaje de contacto SIMG: {{subject}}`
   - To: `alesanchezpov@gmail.com`
   - Bcc: `robertgomez.datascience@gmail.com`
   - Reply-To: `{{reply_to}}`

4. **Configure Environment Variables**
   
   Copy the example file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your EmailJS credentials:
   ```env
   PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
   PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
   PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
   ```

   **Where to find these values:**
   - `PUBLIC_EMAILJS_PUBLIC_KEY`: EmailJS Dashboard → Account → API Keys
   - `PUBLIC_EMAILJS_SERVICE_ID`: EmailJS Dashboard → Email Services (shows next to your Gmail service)
   - `PUBLIC_EMAILJS_TEMPLATE_ID`: EmailJS Dashboard → Email Templates (shows next to your template)

   **Important:** The `.env` file is already in `.gitignore` and won't be committed to Git.

5. **For Production Deployment (Vercel)**
   
   Add the environment variables in your Vercel project settings:
   - Go to Project Settings → Environment Variables
   - Add all three `PUBLIC_EMAILJS_*` variables
   - Deploy or redeploy your site

6. **Test the Form**
   - Restart your dev server: `npm run dev`
   - Fill out the contact form on the website
   - Check both email inboxes for the message
   - Verify reply-to functionality

### Email Template Variables

The form sends these variables to EmailJS:
- `{{from_name}}` - Sender's name
- `{{reply_to}}` - Sender's email address
- `{{subject}}` - Message subject
- `{{message}}` - Message content

### Security Notes

- ✅ **Environment variables are safe**: The `.env` file is gitignored and never committed
- ✅ **Public keys are OK**: EmailJS public keys are meant to be visible in client-side code
- ✅ **Rate limiting**: EmailJS has built-in rate limiting and spam protection
- ✅ **Production ready**: Works seamlessly with Vercel, Netlify, and other platforms

---

## 📺 YouTube Integration Setup

The session recordings page uses **YouTube Data API v3** to automatically fetch and display the latest videos from the SIMG channel.

### Setup Instructions

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Name it (e.g., "SIMG Website")

2. **Enable YouTube Data API v3**
   - In the Cloud Console, go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

3. **Create API Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
   - (Optional) Restrict the key to YouTube Data API v3 for security

4. **Get Your YouTube Channel ID**
   - Visit your YouTube channel: `https://www.youtube.com/@simg-UN`
   - Click "About" tab
   - Click "Share channel" → "Copy channel ID"
   - Alternative: Use the URL structure to find it

5. **Configure Environment Variables**
   
   Edit your `.env` file and add the YouTube credentials:
   ```env
   # YouTube Data API v3
   PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
   PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id_here
   ```

   **Where to find these values:**
   - `PUBLIC_YOUTUBE_API_KEY`: Google Cloud Console → APIs & Services → Credentials
   - `PUBLIC_YOUTUBE_CHANNEL_ID`: YouTube Channel → About → Share → Copy channel ID

6. **For Production Deployment (Vercel)**
   
   Add the environment variables in your Vercel project settings:
   - Go to Project Settings → Environment Variables
   - Add both `PUBLIC_YOUTUBE_API_KEY` and `PUBLIC_YOUTUBE_CHANNEL_ID`
   - Redeploy your site

7. **Test the Integration**
   - Restart your dev server: `bun run dev`
   - Navigate to `/en/sessions/recordings` or `/es/sessions/recordings`
   - Verify that the latest 3 videos from your channel appear
   - Click on a video to ensure it opens on YouTube

### API Features

The integration automatically fetches:
- **Video Thumbnails**: High-quality images (480x360px)
- **Video Titles**: Displayed with 2-line truncation
- **Publication Dates**: Formatted in English/Spanish
- **Video Duration**: Converted from ISO 8601 format (PT1H2M3S → 1:02:03)
- **Direct Links**: Click any video card to watch on YouTube

### Quota Limits

YouTube Data API v3 has quota limits:
- **Daily Quota**: 10,000 units per day (default)
- **Search Request Cost**: ~100 units
- **Videos Request Cost**: ~1 unit
- **Total per page load**: ~101 units
- **Daily page loads possible**: ~99 loads (more than enough for normal traffic)

### Fallback Behavior

If the API key is not configured or requests fail:
- Displays friendly error message
- Provides direct link to YouTube channel
- Doesn't break the page functionality

### Security Notes

- ✅ **API restrictions recommended**: Limit the API key to YouTube Data API v3 only
- ✅ **HTTP referrer restrictions**: Set allowed domains in Google Cloud Console
- ✅ **Public exposure is safe**: Client-side API keys are normal for YouTube API
- ✅ **Rate limiting**: Google handles quota limits automatically

---

## 🚢 Deployment

The site is optimized for deployment on:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

Build command: `npm run build`  
Output directory: `./dist/`

---

## 👥 Team

**Research Supervisor**: [Professor Name]  
**Student Leaders**: Multiple contributors  
**Alumni**: Past members who've contributed to the project

---

## 📺 Connect With Us

<div id="badges">
  <a href="https://www.linkedin.com/in/alejandrosanchezpoveda/">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
  <a href="https://www.youtube.com/channel/UCI5h3tbo4s7VE-VuMMYptYw">
    <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube"/>
  </a>
  <a href="https://x.com/Asperjasp/">
    <img src="https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white" alt="X/Twitter"/>
  </a>
  <a href="https://www.instagram.com/alejosanchezpoveda/">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"/>
  </a>
  <a href="https://github.com/Asperjasp">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  <a href="https://linktr.ee/Asperjasp">
    <img src="https://img.shields.io/badge/Linktree-39E09B?style=for-the-badge&logo=linktree&logoColor=white" alt="Linktree"/>
  </a>
</div>

---

## 📄 License

This project is maintained by the SIMG research seminar at Universidad Nacional de Colombia.

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues or pull requests.

For major changes, please open an issue first to discuss what you would like to change.

---

<div align="center">

**Made with ❤️ by the SIMG Team**

[⬆ Back to Top](#-simg---semillero-de-investigación-en-modelos-generativos)

</div>
