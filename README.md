# 🌌 Sky Story Maker

> Craft, visualize, and share immersive visual stories in seconds.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

Sky Story Maker is a web application designed for seamless visual storytelling. Built with a fast React/Vite architecture, styled with Tailwind CSS, and powered by Supabase on the backend, it allows creators to craft stories, manage media assets, and publish seamlessly.

---

## ✨ Key Features

- **⚡ Fast Web Studio:** Smooth UI for composing visual stories without delay.
- **🎨 Tailwind & shadcn UI:** Modern component styling with responsive dark/light layouts.
- **🗄️ Supabase Integration:** Managed authentication, database persistence, and asset storage.
- **📱 Fully Responsive:** Clean interface tailored across desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Backend & Auth** | [Supabase](https://supabase.com/) |
| **Package Manager** | [Bun](https://bun.sh/) / `npm` |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm` or `bun` package manager

### Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/SumanthChary/sky-story-maker.git](https://github.com/SumanthChary/sky-story-maker.git)
   cd sky-story-maker

```

2. **Install dependencies**
```bash
npm install
# or using Bun
bun install

```


3. **Configure Environment Variables**
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```


4. **Run the development server**
```bash
npm run dev

```


Open [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173&utm_source=gemini) in your browser.

---

## 📂 Project Structure

```
sky-story-maker/
├── public/          # Static assets & icons
├── src/
│   ├── components/  # Reusable UI components (shadcn/ui)
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Application views & routing
│   ├── services/    # API & Supabase client integration
│   └── lib/         # Utility functions
├── supabase/        # Database migrations & backend configuration
└── vite.config.ts   # Build configuration

```

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts local development server |
| `npm run build` | Builds optimized production bundle |
| `npm run lint` | Runs ESLint checks across project files |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the app or add new capabilities:

1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

```

```
