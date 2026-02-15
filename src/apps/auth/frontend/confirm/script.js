import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://piuymzvnztipaxskcjuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rYpXz1mHoTsZ7kB0UuJ21g_XYy3wo3F";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const setCookie = (name, value, maxAge) => {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
};

const { data, error } = await sb.auth.getSession();
if (error || !data) {
    console.error(error);
    document.getElementById('confirmation-message').textContent = 'There was an error while verifying your email. Please try again in a bit.';
}

if (data.session) {
    // Set cookies for auth-refresh.js
    const maxAge = 60 * 60 * 24 * 7; // 1 week
    setCookie('sb-access-token', data.session.access_token, maxAge);
    setCookie('sb-refresh-token', data.session.refresh_token, maxAge);

    document.getElementById('confirmation-message').textContent = 'Your email has been successfully verified! You will get redirected to the app shortly...';
    document.getElementById('confirmation-message').style.color = 'green';
    setTimeout(() => {
        document.location.replace('/app');
    }, 3 * 1000);
}
console.log("Session:", data.session);