# Release Notes

## v1.1.0 - Performance & UI Polish
**Date**: July 2026

### Improvements
- **Hardware Optimization**: Removed forced GPU rasterization flags. The application now degrades gracefully on older or integrated GPUs, avoiding visual artifacts and crashes.
- **Performance**: Code-split the heavy `echarts` dependency from the initial app bundle. The Exam interface now loads significantly faster on low-end hardware.
- **UI Polish**: Fixed double "Back" buttons in the Import, Test Summary, and Analytics screens for a cleaner user experience.
- **Stability**: Added a graceful fallback dialog if the native SQLite module fails to initialize, providing clear instructions instead of failing silently.
- **Optimization**: Removed dead/unused analytics interface files from the renderer bundle to reduce overall package size.


## v1.0.0 - Initial Enterprise Release
**Date**: July 2026

The official 1.0 release of the NEET CBT Engine. This release marks the transition from development to a fully hardened, production-ready Windows application.

### Key Features
- **Offline CBT Simulation**: 100% accurate NTA NEET interface.
- **Local Analytics Engine**: Generates subject-wise, topic-wise, and time-based performance radar charts instantly upon test submission using ECharts.
- **ZIP Import Pipeline**: Ingest tests dynamically using the standardized `.zip` package format. Supports images and Zod schema validation.
- **Headless Optimization**: The exam timer has been decoupled from the React render tree, ensuring 60fps performance across the entire 200-question palette on low-end hardware.
- **Memory-Mapped SQLite**: Database IO optimized for rapid throughput.

### Notes for Windows Users
- This app is distributed as an NSIS installer and a Portable executable.
- Since this is an initial unsigned release, Microsoft SmartScreen may flag the executable. Users will need to click "More Info" -> "Run Anyway" during the first execution.
