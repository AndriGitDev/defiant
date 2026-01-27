# 🛡️ DEFIANT - Breach Timeline

> **Interactive 3D Cyberpunk CVE & Security Breach Tracker**

A stunning cyberpunk-themed web application that visualizes real-time CVE (Common Vulnerabilities and Exposures) data and historical security breaches in an immersive 3D environment.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.169-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

## ✨ Features

### 🎨 Cyberpunk Hacker Aesthetic
- **Immersive 3D Background**: Floating particles, wireframe cubes, and dynamic grid with mouse-interactive camera
- **Glitch Effects**: Text glitching, scanline overlays, and neon glow animations
- **Color Scheme**: Cyber blue (#00f0ff), cyber pink (#ff006e), and purple accents
- **Responsive UI**: Glass-morphism panels with border glow effects

### 🔒 Security Intelligence
- **Unified Vulnerability Data**: Aggregates CVEs from NIST NVD and EUVD for comprehensive coverage.
- **Historical Breaches**: Curated database of major security incidents (Equifax, SolarWinds, Log4Shell, etc.).
- **CVSS Scoring**: Visual severity indicators (CRITICAL, HIGH, MEDIUM, LOW).
- **Detailed Analysis**: Complete CVE details including affected products, weaknesses (CWE), references, and attack vectors

### 🔍 Advanced Filtering
- **Search**: Find CVEs by ID, description, vendor, or product
- **Severity Filter**: Filter by vulnerability severity levels
- **Date Range**: View CVEs from last 7, 30, 90, or 365 days
- **Interactive Timeline**: Click any CVE card for full technical details

### 📊 Dashboard
- **Live Statistics**: Total CVEs, critical/high/medium counts
- **Animated Cards**: Hover effects and smooth transitions
- **Status Indicators**: System online status with pulse animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AndriGitDev/defiant.git
   cd defiant
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Add your Neon PostgreSQL connection string to `.env.local`:
     ```
     DATABASE_URL="your_postgres_connection_string"
     ```
   - **(Optional)** Add your NVD API key for a higher request rate limit:
     ```
     NVD_API_KEY="your_nvd_api_key"
     ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run database migrations**
   - This will sync your database schema with the Drizzle ORM definitions.
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the app in action!

### Database Management

- **Generate Migrations**: After changing the schema in `lib/db/schema.ts`, generate a new migration:
  ```bash
  npm run db:generate
  ```
- **Apply Migrations**: To apply generated migrations to the database:
  ```bash
  npm run db:migrate
  ```
- **Drizzle Studio**: To open a local GUI for your database:
  ```bash
  npm run db:studio
  ```

## 🏗️ Project Structure

```
defiant/
├── app/                  # Main application components
├── components/           # Reusable React components
├── drizzle/              # Drizzle ORM migration files
├── lib/
│   ├── db/               # Drizzle schema and utilities
│   ├── breaches.ts       # Static historical breach data
│   ├── euvdApi.ts        # EUVD API integration
│   ├── nvdApi.ts         # NVD API integration
│   ├── types.ts          # Core TypeScript types
│   └── vulnerabilityApi.ts # Unified vulnerability API
└── public/               # Static assets (fonts, images)
```

## 🎯 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **3D Graphics**: Three.js with React Three Fiber
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Analytics**: Vercel Analytics
- **Icons**: Lucide React
- **Data Sources**:
  - NIST National Vulnerability Database (NVD)
  - European Union Vulnerability Database (EUVD)

## 🌐 Deploy to Vercel

This project is optimized for Vercel deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AndriGitDev/defiant)

### Manual Deployment

```bash
# Build the production version
npm run build

# Deploy to Vercel
npx vercel --prod
```

The app will be live at your Vercel domain!

## 🎨 Customization

### Color Theme
Edit `tailwind.config.ts` to customize the cyberpunk color scheme:
```typescript
colors: {
  cyber: {
    black: "#0a0e27",
    blue: "#00f0ff",
    pink: "#ff006e",
    // ...
  }
}
```

### Add More Breaches
Add historical breaches to `lib/breaches.ts`:
```typescript
{
  id: "breach-id",
  name: "Breach Name",
  date: "2024-01-01",
  // ...
}
```

## 📊 Features Roadmap

- [ ] 3D interactive node graph for CVE relationships
- [ ] RSS feed integration for security blogs
- [ ] Export CVE data to PDF/CSV
- [ ] User watchlist for specific vendors/products
- [ ] Real-time notifications for critical CVEs
- [ ] Exploit availability tracking
- [ ] Integration with security tools (MITRE ATT&CK)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🛡️ Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for reporting instructions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- CVE data provided by [NIST National Vulnerability Database](https://nvd.nist.gov/)
- Inspired by cyberpunk aesthetics and the need for better security visualization tools

## ⚠️ Disclaimer

This tool is for educational and informational purposes. Always verify CVE information from official sources before taking action.

---

**Built with 💙 by security enthusiasts for security enthusiasts**
