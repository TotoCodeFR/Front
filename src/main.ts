import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { getDopplerClient } from './utility/doppler.ts';
import { getSupabaseClient } from './utility/supabase.ts';
import { loadApps } from './utility/loader.ts';

// Doppler init
await getDopplerClient();

const app = new Hono();

// Supabase init
try {
    getSupabaseClient();
} catch (e: any) {
    console.warn('Supabase client initialization skipped or failed during startup:', e?.message);
    console.warn(e);
}

// Handle /app
app.get('/app', (c) => c.redirect('/app/'));

// Serve assets
app.use('/app/*', serveStatic({
    root: './src/app',
    rewriteRequestPath: (path) => path.replace(/^\/app/, '')
}));

// Serve public assets to root
app.use('/*', serveStatic({ root: './src/public' }));

// Load apps
await loadApps(app);

const port = parseInt(process.env.PORT || '3000');

console.log(`Front is running on port ${port}`);

export default {
    port,
    fetch: app.fetch,
};
