import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://piuymzvnztipaxskcjuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rYpXz1mHoTsZ7kB0UuJ21g_XYy3wo3F";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await sb.auth.getSession();
if (error || !data) {
    console.error(error);
    document.getElementById('confirmation-message').textContent = 'There was an error while verifying your email. Please try again in a bit.';
}

if (data.session) {
    document.getElementById('confirmation-message').textContent = 'Your email has been successfully verified! You will get redirected to the app shortly...';
    document.getElementById('confirmation-message').style.color = 'green';
    setTimeout(() => {
        document.location.replace('/app');
    }, 3 * 1000);
}
console.log("Session:", data.session);