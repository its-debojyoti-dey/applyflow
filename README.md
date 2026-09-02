# ApplyFlow - LinkedIn Job Search & Application Helper

> A powerful Manifest V3 Chrome Extension designed to streamline candidate job hunting on LinkedIn and Y Combinator Work at a Startup.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)
![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)

---

## Features

- 🎯 **Custom Time Filters**: Filter LinkedIn job postings with precise custom timeframes (e.g., past 2 hours, past 12 hours) beyond standard default dropdowns.
- 🚫 **Company Blocklist**: Hide unwanted companies or staffing agencies automatically from your job search feed.
- 👤 **Recruiter Profile Inspector**: Quickly detect hiring managers and recruiter profiles associated with posted job descriptions.
- 🚀 **YC Work at a Startup Integration**: Content scripts designed for seamless navigation across YC company listings and LinkedIn jobs.
- ⚡ **Lightweight & Fast**: Built with React 19, TypeScript, Tailwind CSS, and CRXJS Vite plugin for fast builds and hot-module replacement.

---

## Tech Stack

- **Frontend UI**: React 19, Lucide Icons, TypeScript
- **Extension Architecture**: Chrome Extension Manifest V3 (Popup, Content Scripts, Service Worker)
- **Build Tooling**: Vite 6, `@crxjs/vite-plugin`

---

## Installation & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/its-debojyoti-dey/applyflow.git
cd applyflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Extension
```bash
npm run build
```
The compiled production extension will be output to the `dist/` directory.

### 4. Load into Browser
1. Open Chrome / Edge / Brave and navigate to `chrome://extensions`.
2. Toggle **Developer mode** on in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist/` folder inside the project directory.
5. Navigate to [LinkedIn Jobs](https://www.linkedin.com/jobs) to use ApplyFlow!

---

## License

MIT © [Debojyoti Dey](https://github.com/its-debojyoti-dey)
