import { Hono } from 'hono';

const drive = new Hono();

drive.get('/ping', (c) => {
    return c.json({ message: 'pong from drive' });
});

export default drive;
