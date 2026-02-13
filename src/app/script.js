import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://piuymzvnztipaxskcjuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rYpXz1mHoTsZ7kB0UuJ21g_XYy3wo3F";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

const accessToken = getCookie('sb-access-token');
const refreshToken = getCookie('sb-refresh-token');

if (!accessToken || !refreshToken) {
    document.location.replace("/app/auth");
    throw new Error("No session found");
}

const { data, error } = await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

if (error || !data.session) {
    document.location.replace("/app/auth");
}

console.log(data);

document.getElementById('greet').textContent = "Hello " + data.user.email;

function hand_appButton(btn) {
    btn.addEventListener('click', () => {
        const appName = btn.id;

        window.history.pushState(null, "", `/app/${appName}`);

        location.reload();
    });
}

function setHand_appButton() {
    for (const btn of document.getElementById('apps').children) {
        hand_appButton(btn);
    };
}

setHand_appButton();