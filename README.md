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
- **Real-time CVE Data**: Fetches latest vulnerabilities from NIST NVD API
- **Historical Breaches**: Curated database of major security incidents (Equifax, SolarWinds, Log4Shell, etc.)
- **CVSS Scoring**: Visual severity indicators (CRITICAL, HIGH, MEDIUM, LOW)
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

### Installation

```bash
# Clone the repository
git clone https://github.com/AndriGitDev/defiant.git
cd defiant

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app in action!

## 🏗️ Project Structure

```
defiant/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles & animations
├── components/
│   ├── CyberBackground.tsx # 3D Three.js background
│   ├── Header.tsx          # App header with branding
│   ├── StatsPanel.tsx      # Statistics dashboard
│   ├── SearchPanel.tsx     # Search & filter controls
│   ├── TimelineView.tsx    # CVE grid/timeline view
│   └── CVEDetailModal.tsx  # Detailed CVE modal
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── nvdApi.ts           # NVD API integration
│   └── breaches.ts         # Historical breach database
└── public/                 # Static assets
```

## 🎯 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: NIST NVD CVE Database 2.0

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

## 🔑 API Configuration (Optional)

For higher rate limits on NVD API requests:

1. Request an API key at [NVD Developer Portal](https://nvd.nist.gov/developers/request-an-api-key)
2. Create `.env.local`:
   ```bash
   NVD_API_KEY=your_api_key_here
   ```
3. Update `lib/nvdApi.ts` to include the API key in headers

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

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - feel free to use this project for educational and commercial purposes.

## 🙏 Credits

- CVE data provided by [NIST National Vulnerability Database](https://nvd.nist.gov/)
- Inspired by cyberpunk aesthetics and the need for better security visualization tools

## ⚠️ Disclaimer

This tool is for educational and informational purposes. Always verify CVE information from official sources before taking action.

---

**Built with 💙 by security enthusiasts for security enthusiasts**
