/**
 * Electron Main Process Entry
 *
 * Responsibilities:
 * 1. Create the BrowserWindow
 * 2. Initialize logging
 * 3. Initialize SQLite database
 * 4. Register IPC handlers
 * 5. Handle app lifecycle
 */

import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import { initializeLogger, logger } from './logger';
import { initializeDatabase, closeDatabase } from './database/connection';
import { registerIpcHandlers } from './ipc';
import { getAppPaths } from './config/paths.config';
import { APP_CONFIG } from './config/app.config';
import { MAIN_CONSTANTS } from './config/constants';

// Vite plugin injects these constants at build time
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const log = logger.module('Main');

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { window } = APP_CONFIG;

  mainWindow = new BrowserWindow({
    width: window.defaultWidth,
    height: window.defaultHeight,
    minWidth: window.minWidth,
    minHeight: window.minHeight,
    title: APP_CONFIG.name,
    show: false,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#ECEFF1',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Load the renderer
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    log.info('Main window shown');
  });

  // Handle ESC key to exit fullscreen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape' && mainWindow?.isFullScreen()) {
      mainWindow.setFullScreen(false);
      event.preventDefault();
    }
  });

  // Open DevTools in development
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Track fullscreen changes for event logging
  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('fullscreen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('fullscreen-changed', false);
  });

  // Track focus changes for event logging
  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('window-focus-changed', false);
  });

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('window-focus-changed', true);
  });
}

/**
 * Register custom protocol for serving local images
 * Usage: neet-image://testId/imageName.png
 */
function registerImageProtocol(): void {
  protocol.handle(MAIN_CONSTANTS.IMAGE_PROTOCOL, (request) => {
    const url = new URL(request.url);
    const paths = getAppPaths();
    const imagePath = path.join(paths.images, url.hostname, url.pathname);
    return net.fetch(`file://${imagePath}`);
  });
  log.info('Image protocol registered');
}

// ─── App Lifecycle ──────────────────────────────────────────────

// Hardware acceleration is handled gracefully by Electron's default blocklist.
// We avoid forcing GPU rasterization via appendSwitch as it can cause artifacts on weak integrated GPUs.

app.whenReady().then(() => {
  initializeLogger();
  log.info(`${APP_CONFIG.name} v${APP_CONFIG.version} starting...`);

  // Initialize paths (creates directories)
  const paths = getAppPaths();
  log.info(`Data directory: ${paths.data}`);

  // Initialize database (graceful — may fail if native module not compiled)
  try {
    initializeDatabase();
  } catch (error) {
    log.error('Database initialization failed (native module may need rebuilding):', error);
    log.warn('App will start without database. Run "npm run rebuild" after installing VS Build Tools.');
    
    // Show an intelligible error dialog to the user rather than failing silently
    import('electron').then(({ dialog }) => {
      dialog.showErrorBox(
        'Database Initialization Error',
        `Failed to load the database module.\n\nThis typically happens if the native SQLite binary is missing or incompatible with your system.\n\nError details: ${error instanceof Error ? error.message : String(error)}`
      );
    });
  }

  // Register custom protocol
  registerImageProtocol();

  // Register IPC handlers
  registerIpcHandlers();

  // Create window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  log.info('Application initialized successfully');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
  log.info('Application shutting down');
});

process.on('SIGTERM', () => {
  log.info('Received SIGTERM, quitting gracefully');
  app.quit();
});

process.on('SIGINT', () => {
  log.info('Received SIGINT, quitting gracefully');
  app.quit();
});
