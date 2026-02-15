import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { getDopplerClient } from './utility/doppler.ts';
import { getSupabaseClient } from './utility/supabase.ts';
import { loadApps } from './utility/loader.ts';

// Initialize Doppler secrets
await getDopplerClient();

const app = new Hono();

// Initialize Supabase (now that env vars are loaded from Doppler)
try {
    getSupabaseClient();
} catch (e) {
    console.warn('Supabase client initialization skipped or failed during startup:', e.message);
}

// Handle /app without trailing slash
app.get('/app', (c) => c.redirect('/app/'));

// Serve main app assets
app.use('/app/*', serveStatic({ 
    root: './src/app',
    rewriteRequestPath: (path) => path.replace(/^\/app/, '')
}));

// Serve public assets (mounted at root in original express setup)
app.use('/*', serveStatic({ root: './src/public' }));

// Load dynamic apps
await loadApps(app);

const port = parseInt(process.env.PORT || '3000');

console.log(`Front is running on port ${port}`);

export default {
    port,
    fetch: app.fetch,
};
