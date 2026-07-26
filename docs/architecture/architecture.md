# NEET CBT Engine Architecture

The NEET CBT Engine is a robust, offline-first Windows desktop application built with Electron, React, and SQLite. It is designed to perfectly simulate the Computer-Based Test (CBT) environment while providing deep, local intelligence analytics.

## High-Level Architecture

The application strictly adheres to the **Main Process vs. Renderer Process** security paradigm enforced by Electron.

### 1. Main Process (Node.js)
The Main Process (`app/main/`) handles all system-level operations:
- **SQLite Database (`better-sqlite3`)**: Runs in WAL mode with a 256MB memory map for maximum performance.
- **ZIP Import Pipeline (`yauzl`)**: securely extracts packages, validates JSON against strict Zod schemas, migrates image assets to the local filesystem, and runs atomic database transactions.
- **Window Management**: Controls the `BrowserWindow` creation, applying GPU acceleration flags and hardware fallbacks.

### 2. Preload Script
The Preload script (`app/preload/`) uses `contextBridge` to expose a secure, typed `ipc` object to the Renderer. NodeIntegration is strictly **disabled**, and ContextIsolation is **enabled**.

### 3. Renderer Process (React & Vite)
The Renderer Process (`app/renderer/`) handles the UI:
- **State Management (`Zustand`)**: Manages the exam session state, navigation history, and decoupled timer subscriptions.
- **UI Components (`TailwindCSS`)**: Styled specifically for a distraction-free, high-contrast Windows desktop environment.
- **Analytics Visualization (`ECharts`)**: Renders complex radar charts and intelligence reports entirely offline.

## Core Engines

### The Exam Engine
A React-based module that guarantees 60fps performance even on low-end hardware by memoizing the Question Palette, decoupling the countdown timer into headless hooks, and using asynchronous decoding for images.

### The Import Engine
A Node.js service that handles ZIP files (up to 500MB). It extracts the package into a hidden `userData` temp folder, strictly validates `metadata.json` and `questions.json`, moves images to a permanent asset store, and safely inserts data into SQLite via atomic transactions.

### The Analytics Engine
Queries the local SQLite database to compute accuracy ratios, subject performance matrices, time-spent analysis, and historical trend lines.
