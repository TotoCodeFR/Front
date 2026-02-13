import { getDopplerClient } from './utility/doppler.js';
await getDopplerClient();
import { getSupabaseClient } from './utility/supabase.js';
import express from 'express';
import { loadApps } from './utility/loader.js';

const sb = getSupabaseClient();

const app = express();

app.use(express.json());

// main and public assets
app.use('/app', express.static('src/app'));
app.use('/', express.static('src/public'));

// load apps
await loadApps(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Front is running on port ${PORT}`);
});