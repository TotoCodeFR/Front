import { Router } from "express";
import { getSupabaseClient } from "../../utility/supabase.js";

const sb = getSupabaseClient();
const router = new Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'http://localhost:3000/app/auth/confirm' // This should be your client-side confirmation URL
        }
    });

    if (error) {
        console.error('[Auth] Signup error: ', error);
        return res.status(400).json({
            error: error.message
        });
    }

    if (data.user && !data.session) {
        return res.status(200).json({
            message: 'User created successfully. Please check your email for verification.'
        });
    }

    return res.status(200).json({
        user: data.user,
        session: data.session
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('[Auth] Login error: ', error);
        return res.status(401).json({
            error: error.message
        });
    }

    return res.status(200).json({
        user: data.user,
        session: data.session
    });
});

router.post('/confirm', async (req, res) => {
    const { token, type, email } = req.body;

    if (!token || !type || !email) {
        return res.status(400).json({ error: 'Missing token, type or email for confirmation.' });
    }

    try {
        const { data, error } = await sb.auth.verifyOtp({ token, type, email });

        if (error) {
            console.error('[Auth] Email confirmation error: ', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Email confirmed successfully!', user: data.user });
    } catch (error) {
        console.error('[Auth] Unexpected error during email confirmation:', error);
        return res.status(500).json({ error: 'An unexpected error occurred during email confirmation.' });
    }
});

router.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const { data, error } = await sb.auth.refreshSession({ refresh_token });

        if (error) {
            console.error('[Auth] Refresh error: ', error);
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        if (!data.session) {
            return res.status(401).json({ error: 'Session not found' });
        }

        return res.status(200).json({
            session: data.session
        });

    } catch (err) {
        console.error('[Auth] Unexpected error during token refresh:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;