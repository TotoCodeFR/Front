import { Hono } from 'hono';
import { getSupabaseClient } from '../../utility/supabase.ts';

const auth = new Hono();

auth.post('/signup', async (c) => {
    const sb = getSupabaseClient();
    const { email, password } = await c.req.json();

    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'http://localhost:3000/app/auth/confirm'
        }
    });

    if (error) {
        console.error('[Auth] Signup error: ', error);
        return c.json({ error: error.message }, 400);
    }

    if (data.user && !data.session) {
        return c.json({
            message: 'User created successfully. Please check your email for verification.'
        }, 200);
    }

    return c.json({
        user: data.user,
        session: data.session
    }, 200);
});

auth.post('/login', async (c) => {
    const sb = getSupabaseClient();
    const { email, password } = await c.req.json();

    const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('[Auth] Login error: ', error);
        return c.json({ error: error.message }, 401);
    }

    return c.json({
        user: data.user,
        session: data.session
    }, 200);
});

auth.post('/confirm', async (c) => {
    const sb = getSupabaseClient();
    const { token, type, email } = await c.req.json();

    if (!token || !type || !email) {
        return c.json({ error: 'Missing token, type or email for confirmation.' }, 400);
    }

    try {
        const { data, error } = await sb.auth.verifyOtp({ token, type, email });

        if (error) {
            console.error('[Auth] Email confirmation error: ', error);
            return c.json({ error: error.message }, 400);
        }

        return c.json({ message: 'Email confirmed successfully!', user: data.user }, 200);
    } catch (error) {
        console.error('[Auth] Unexpected error during email confirmation:', error);
        return c.json({ error: 'An unexpected error occurred during email confirmation.' }, 500);
    }
});

auth.post('/refresh', async (c) => {
    const sb = getSupabaseClient();
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
        return c.json({ error: 'Refresh token is required' }, 400);
    }

    try {
        const { data, error } = await sb.auth.refreshSession({ refresh_token });

        if (error) {
            console.error('[Auth] Refresh error: ', error);
            return c.json({ error: 'Invalid or expired refresh token' }, 401);
        }

        if (!data.session) {
            return c.json({ error: 'Session not found' }, 401);
        }

        return c.json({
            session: data.session
        }, 200);

    } catch (err) {
        console.error('[Auth] Unexpected error during token refresh:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export default auth;
