# Release Notes

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
