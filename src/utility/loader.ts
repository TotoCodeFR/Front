import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import fs from 'node:fs';
import path from 'node:path';

export const loadApps = async (app: Hono) => {
    const appsPath = path.resolve('src/apps');
    if (!fs.existsSync(appsPath)) return;

    const entries = fs.readdirSync(appsPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const appName = entry.name;
            const appDir = path.join(appsPath, appName);

            // backend API
            const mainPath = path.join(appDir, 'main.ts');
            // Check for both .ts and .js during migration
            const mainJsPath = path.join(appDir, 'main.js');
            
            const targetPath = fs.existsSync(mainPath) ? mainPath : (fs.existsSync(mainJsPath) ? mainJsPath : null);

            if (targetPath) {
                try {
                    const module = await import(targetPath);
                    const subApp = module.default;
                    if (subApp) {
                        // Hono uses app.route for sub-apps
                        app.route(`/api/${appName}`, subApp);
                        console.log(`[Backend] Loaded API for: ${appName}`);
                    } else {
                        console.warn(`Backend for ${appName} doesn't have a default export (Hono instance)`);
                    }
                } catch (err) {
                    console.error(`Failed to load backend for ${appName}:`, err);
                }
            }

            // frontend static files
            const frontendPath = path.join(appDir, 'frontend');
            if (fs.existsSync(frontendPath)) {
                // Serve static files
                app.use(`/app/${appName}/*`, serveStatic({ 
                    root: `./src/apps/${appName}/frontend`,
                    rewriteRequestPath: (path) => path.replace(`/app/${appName}`, '')
                }));

                // SPA catch-all for this app
                app.get(`/app/${appName}/*`, async (c) => {
                    const filePath = `./src/apps/${appName}/frontend/index.html`;
                    return c.html(await Bun.file(filePath).text());
                });

                console.log(`[Frontend] Loaded Static files for: ${appName}`);
            }
        }
    }
};
