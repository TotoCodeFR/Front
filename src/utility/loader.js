import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

export const loadApps = async (app) => {
    const appsPath = path.resolve('src/apps');
    if (!fs.existsSync(appsPath)) return;

    const entries = fs.readdirSync(appsPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const appName = entry.name;
            const appDir = path.join(appsPath, appName);

            // backend API
            const mainPath = path.join(appDir, 'main.js');
            if (fs.existsSync(mainPath)) {
                try {
                    const { default: router } = await import(`../apps/${appName}/main.js`);
                    if (router) {
                        app.use(`/api/${appName}`, router);
                        console.log(`[Backend] Loaded API for: ${appName}`);
                    }
                } catch (err) {
                    console.error(`Failed to load backend for ${appName}:`, err);
                }
            }

            // frontend static files
            const frontendPath = path.join(appDir, 'frontend');
            if (fs.existsSync(frontendPath)) {
                app.use(`/app/${appName}`, express.static(frontendPath));

                app.get(`/app/${appName}*splat`, (req, res) => {
                    if (path.extname(req.path)) {
                        const filePath = path.join(frontendPath, req.path.replace(`/app/${appName}`, ''));
                        if (fs.existsSync(filePath)) {
                            return res.sendFile(filePath);
                        }
                    }
                    res.sendFile(path.join(frontendPath, 'index.html'));
                });

                console.log(`[Frontend] Loaded Static files for: ${appName}`);
            }
        }
    }
};