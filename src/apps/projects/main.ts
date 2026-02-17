import { Hono } from 'hono';
import util from './utility.ts';
import { getSupabaseClient } from '../../utility/supabase.ts';

const sb = getSupabaseClient();

const projects = new Hono();

// Note to self: do not make API routes at /api/{app}, else there are 404 errors...
projects.put('/create', async (c) => {
    const body = await c.req.json();
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization header with Bearer token is required' }, 401);
    }

    const token = authHeader.substring(7);

    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
        return c.json({ error: authError?.message || 'User not found or invalid token' }, 404);
    }
    const userUUID = user.id;
    const result = await util.create(userUUID, body.projectName, body.projectRepo || '');

    if (!Array.isArray(result)) {
        return c.json({ error: 'Failed to create project', details: result }, 500);
    }

    return c.json({ message: 'Project created', data: result[0] });
});

projects.get('/get', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization header with Bearer token is required' }, 401);
    }

    const token = authHeader.substring(7);

    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
        return c.json({ error: authError?.message || 'User not found or invalid token' }, 404);
    }
    const userUUID = user.id;

    const projectName = c.req.query('projectName');
    const projectRepo = c.req.query('projectRepo');
    const projectUUID = c.req.query('projectUUID');

    const projectsResult = await util.get({
        owner: userUUID,
        name: projectName as string | null,
        repo: projectRepo as string | null,
        id: projectUUID ? projectUUID : null
    });

    if (!Array.isArray(projectsResult)) {
        return c.json({ error: 'Failed to retrieve projects', details: projectsResult }, 500);
    }

    return c.json(projectsResult);
});

projects.patch('/edit', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization header with Bearer token is required' }, 401);
    }

    const token = authHeader.substring(7);

    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
        return c.json({ error: authError?.message || 'User not found or invalid token' }, 404);
    }
    const userUUID = user.id;

    const body = await c.req.json();
    const projectResult = await util.get({ owner: userUUID, id: body.projectUUID });
    if (!Array.isArray(projectResult)) {
        return c.json({ error: 'Failed to retrieve project', details: projectResult }, 500);
    }
    if (projectResult.length === 0) {
        return c.json({ error: 'Project not found or you are not the owner' }, 404);
    }

    const result = await util.edit(body.projectUUID, body.projectName, body.projectRepo);

    if (!Array.isArray(result)) {
        return c.json({ error: 'Failed to edit project', details: result }, 500);
    }

    return c.json({ message: 'Project edited', data: result[0] });
});

projects.delete('/delete', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization header with Bearer token is required' }, 401);
    }

    const token = authHeader.substring(7);

    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
        return c.json({ error: authError?.message || 'User not found or invalid token' }, 404);
    }
    const userUUID = user.id;

    const projectUUID = c.req.query('projectUUID');
    if (!projectUUID) {
        return c.json({ error: 'projectUUID is required' }, 400);
    }

    // Check ownership before deleting
    const projectResult = await util.get({ owner: userUUID, id: projectUUID });
    if (!Array.isArray(projectResult)) {
        return c.json({ error: 'Failed to retrieve project', details: projectResult }, 500);
    }
    if (projectResult.length === 0) {
        return c.json({ error: 'Project not found or you are not the owner' }, 404);
    }

    const result = await util.delete(projectUUID);
    if (!Array.isArray(result)) {
        return c.json({ error: 'Failed to delete project', details: result }, 500);
    }
    return c.json({ message: 'Project deleted', data: result[0] });
});

export default projects;
