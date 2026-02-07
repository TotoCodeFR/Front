import { Router } from 'express';

const router = new Router();

router.get('/ping', (req, res) => {
    res.json({ message: 'pong from drive' });
});

export default router;