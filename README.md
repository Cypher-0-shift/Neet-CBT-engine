<div align="center">
  <img src="assets/icons/icon.png" alt="NEET CBT Engine Logo" width="120" />
  <h1>NEET CBT Engine</h1>
  <p><strong>An Enterprise-Grade, Offline-First Computer-Based Test Simulator</strong></p>
</div>

---

## 📌 Project Overview
The **NEET CBT Engine** is a high-performance Windows desktop application designed to perfectly simulate the National Eligibility cum Entrance Test (NEET) computer-based test environment. 

Built from the ground up for strict isolation and massive data throughput, it allows educational institutions and students to import raw JSON `.zip` packages of mock tests, attempt them in a distraction-free, hardware-accelerated interface, and instantly generate highly detailed psychometric analytics—all entirely **offline**.

## ✨ Key Features
- **Authentic NTA Interface**: A 1:1 replica of the official CBT experience (Question Palette, Not Visited / Not Answered / Answered / Marked for Review logic).
- **Dynamic ZIP Imports**: Drag and drop `.zip` test packages. The internal engine safely extracts images, validates JSON against strict Zod schemas, and maps them to local storage.
- **Advanced ECharts Analytics**: Instant generation of radar charts, time-spent analysis, and accuracy ratios immediately upon test submission.
- **Wrong Question Notebook**: Automatically catalogues incorrect questions into a searchable local revision gallery.
- **Intelligent Timer Hooks**: React rendering is decoupled from the countdown clock, preventing UI lag and ensuring 60fps performance on budget laptops.

## 🔌 Offline-First Design
The core philosophy of this engine is absolute data sovereignty and offline capability:
- **No Cloud Dependencies**: The application does not ping any external servers during the exam or while computing analytics.
- **Local SQLite Storage**: All imported questions, images, user profiles, and historical sessions are permanently stored in a local SQLite database running in WAL (Write-Ahead Logging) mode, mapped into a 256MB memory space for near-instant IO.

## 🛠 Technology Stack
- **Framework**: Electron (Node.js Main Process, Chromium Renderer)
- **UI & State**: React, Zustand, TailwindCSS
- **Build Tooling**: Vite, TypeScript, Electron-Builder
- **Database**: `better-sqlite3`
- **Validation**: Zod
- **Visualizations**: Apache ECharts
- **File Parsing**: `yauzl` (ZIP extraction)

## 🏗 Architecture Overview
This app strictly enforces Electron's security boundaries:
1. **Main Process (`app/main`)**: The Node.js layer. Handles raw filesystem access, ZIP extractions, SQLite DB connections, and atomic transactions.
2. **Preload Script (`app/preload`)**: Exposes a typed, secure `ipc` contract. NodeIntegration is strictly disabled. ContextIsolation is enforced.
3. **Renderer Process (`app/renderer`)**: The React UI layer. Pure, stateless views bound to Zustand stores.

## 📁 Repository Structure
```text
Neet-CBT-engine/
├── app/                  # Application source code
│   ├── main/             # Electron Main Process (SQLite, IPC, File System)
│   ├── preload/          # Secure Context Bridge
│   └── renderer/         # React UI (CBT Screen, Analytics, Settings)
├── docs/                 # Extensive project documentation
│   ├── architecture/     # System design decisions
│   ├── database/         # SQLite schema layouts
│   └── specifications/   # JSON Schema and AI Prompts
├── assets/               # Branding and app icons
├── scripts/              # Build utilities
├── tests/                # Vitest configurations
├── .github/              # GitHub Action workflows
├── package.json          # Dependencies & Scripts
├── electron-builder.yml  # Packaging configuration
└── vite.*.config.ts      # Vite build configurations
```

## 🚀 Installation & Usage

### For Users
Download the latest Windows Installer (`.exe`) from the **Releases** tab.
1. Run the installer (it handles prerequisites automatically).
2. Launch the app.
3. Import a Mock Test `.zip` file into the Library.
4. Click **Start Exam**.

### Windows Compatibility & SmartScreen Notes
> [!WARNING]
> Because this is currently an open-source project without a paid EV Code Signing Certificate, Microsoft SmartScreen will display a "Windows protected your PC" warning upon first launch. 
> **To bypass:** Click **More info** -> **Run anyway**. 

## 💻 Development Steps
To run the engine locally from source:

1. **Clone the repo**
   ```bash
   git clone https://github.com/Cypher-0-shift/Neet-CBT-engine.git
   cd Neet-CBT-engine
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Rebuild native modules** (Required for SQLite on Windows)
   ```bash
   npm run rebuild
   ```
4. **Start the development server**
   ```bash
   npm start
   ```
5. **Build for Production** (Generates NSIS Installer in `dist/`)
   ```bash
   npm run build:win
   ```

## 📦 Import Package Format
The engine requires a specific ZIP structure to import tests:
```text
exam.zip
├── metadata.json     # Exam rules, duration, marks, and taxonomy
├── questions.json    # The array of questions, options, and correct answers
└── images/           # Local diagrams and formulas linked in the JSON
```
For the exact Zod specifications and the official AI Conversion Prompt, see `docs/specifications/cbt-package-spec.md` and `docs/specifications/prompt.txt`.

## 🔄 CBT Workflow
1. **Import Wizard**: Validates the ZIP hash, normalizes data, and injects into SQLite.
2. **Welcome Screen**: Select exam mode and review candidate details.
3. **Exam Screen**: The core test environment. The timer is locked. Navigation is tracked.
4. **Submission**: Atomic commit of user responses (`session_responses`).
5. **Analytics Engine**: Parses the SQLite tables to instantly render ECharts of performance.

## 📊 Analytics Summary
The Analytics Dashboard provides:
- Overall Score, Rank Percentile estimation, and Accuracy Rate.
- Subject-wise performance radar charts.
- Time-spent analysis (e.g., identifying questions where the user spent > 3 minutes).
- Direct access to the **Wrong Question Notebook**.

## 🧪 Testing Notes
The project uses Vitest. To run the TypeScript linting and unit tests:
```bash
npm run lint
npm run test
```

## 🤝 Contribution Guidelines
Contributions are welcome! Please follow these rules:
1. Ensure `npm run lint` passes before opening a PR.
2. Do not introduce any cloud dependencies (Firebase, Supabase, AWS) to the core engine. Offline-first is non-negotiable.
3. Use the provided Issue Templates in `.github/ISSUE_TEMPLATE`.

## 🗺 Roadmap
See `docs/roadmap/roadmap.md` for our upcoming features, including PDF Export Engines and Advanced Psychometric Radar Profiles.

## 📄 License
This project is currently UNLICENSED. (Update with MIT/GPL depending on repository owner preference).
