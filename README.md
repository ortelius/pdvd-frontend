# SCEC Frontend (pdvd-frontend)

A **Next.js 14** frontend application that mimics the Ortelius search interface.  
This project provides the user interface for browsing, searching, and filtering container images and related artifacts within the PDVD / SCEC ecosystem.

---

## Overview

The SCEC Frontend delivers a modern, responsive search experience aligned with Ortelius design patterns. It includes real-time filtering, category-based navigation, and detailed image views, and is intended to run alongside the `pdvd-backend` service.

---

## Features

- Search results page with grid layout (no landing page)
- Responsive grid layout:
  - 3 columns on desktop
  - 2 columns on tablet
  - 1 column on mobile
- Left sidebar with filter options:
  - Image Type
  - Operating System
  - Architectures
- Functional filters with real-time result updates
- Category tabs:
  - All
  - Images
  - Plugins
- Search functionality in the header
- Click-through cards for detailed views
- Detail page includes:
  - Full image information
  - Tags
  - Pull command
- Back navigation from detail page
- Responsive layout aligned with Ortelius UX
- Mock data support for frontend development

---

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

---

## Routes

| Route | Description |
|------|-------------|
| `/` | Main search page with grid results and filters |
| `/image/[name]` | Detail page for a specific image (example: `/image/nginx`) |

---

## Related Repositories

pdvd-backend
https://github.com/ortelius/pdvd-backend

---

## Filter Options

- **Image Type**: Official Images, Verified Publisher
- **Operating System**: Linux, Windows
- **Architectures**: ARM 64, AMD64, ARM

---

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Install with Docker-Compose

1. Install docker <https://docs.docker.com/get-started/get-docker/>

2. Clone frontend application
```bash
git clone https://github.com/ortelius/pdvd-frontend
```

3. Clone backend application
```bash
git clone https://github.com/ortelius/pdvd-backend
```

4. Run docker-compose
```bash
docker-compose up
```

