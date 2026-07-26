# NEET CBT Engine - Roadmap

## Current Status (v1.0.0)
The core CBT engine, local SQLite analytics, and the ZIP package import pipeline are fully implemented and optimized for Windows deployment.

## Next Steps (v1.1.0)
- **Advanced ECharts Radar Profiles**: Provide deeper psychometric analysis (e.g. rushing vs. lagging on tough questions).
- **PDF Export Engine**: Generate print-ready PDF reports of the user's exam performance and wrong question notebook.
- **Auto-Updater**: Implement `electron-updater` for seamless over-the-air (OTA) updates on Windows.

## Future Vision (v2.0.0)
- **Cloud Sync Integration**: Optional Firebase/Supabase integration to sync local SQLite data to the cloud for cross-device usage.
- **AI Peer Analysis**: Aggregate anonymous local data to compare user percentiles against a simulated dataset.
- **Mac/Linux Ports**: Extend CI/CD pipelines to build and sign `.dmg` and `.AppImage` packages.
