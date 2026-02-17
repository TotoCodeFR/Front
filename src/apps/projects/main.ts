import { Hono } from 'hono';
import util from './utility.ts';
import { UUID } from 'node:crypto';

const projects = new Hono();

// Note to self: do not make API routes at /api/{app}, else there are 404 errors...
projects.put('/create', async (c) => {
    const body = await c.req.json();
    const result = await util.create(body.userUUID, body.projectName, body.projectRepo || '');
    return c.json({ message: 'Project created', data: result });
});

projects.get('/get', async (c) => {
    const userUUID = c.req.query('userUUID'); /* TODO: do NOT use UUIDs, because ANY user can make a request as someone else.
                                                 Instead, use some auth tokens w/ checks */
    const projectName = c.req.query('projectName');
    const projectRepo = c.req.query('projectRepo');
    const projectUUID = c.req.query('projectUUID');

    if (!userUUID) {
        return c.json({ error: 'userUUID is required' }, 400);
    }

    const project = await util.get({
        owner: userUUID as UUID,
        name: projectName as string | null,
        repo: projectRepo as string | null,
        id: projectUUID ? projectUUID as UUID : null
    });

    return c.json(project);
});

projects.patch('/edit', async (c) => {
    const body = await c.req.json();
    const result = await util.edit(body.projectUUID, body.projectName, body.projectRepo);
    return c.json({ message: 'Project edited', data: result });
});

projects.delete('/delete', async (c) => {
    const projectUUID = c.req.query('projectUUID');
    if (!projectUUID) {
        return c.json({ error: 'projectUUID is required' }, 400);
    }
    const result = await util.delete(projectUUID as UUID);
    return c.json({ message: 'Project deleted', data: result });
});

export default projects;
