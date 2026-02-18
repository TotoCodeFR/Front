(function () {
    /**
     * Helper to retrieve a cookie by name.
     */
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    /**
     * Helper to check if the JWT token is expired.
     */
    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            return (Date.now() / 1000) > (payload.exp - 10); // 10s buffer
        } catch (e) {
            return true;
        }
    };

    /**
     * Calls the backend to refresh the access token using the refresh token.
     */
    const refreshSession = async () => {
        const refreshToken = getCookie('sb-refresh-token');
        if (!refreshToken) return;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update cookies with new tokens
                const maxAge = data.session.expires_in; // 1 hour
                document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
                document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
                console.debug('Session refreshed successfully.');
            } else {
                console.warn('Session refresh failed:', data.error);
                // Optional: Redirect to login if the refresh token is invalid
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error refreshing session:', error);
        }
    };

    // Initialize the refresh logic
    const initAuthRefresh = () => {
        const refreshToken = getCookie('sb-refresh-token');
        if (refreshToken) {
            const accessToken = getCookie('sb-access-token');
            if (isTokenExpired(accessToken)) {
                refreshSession();
            }
            setInterval(refreshSession, 45 * 60 * 1000);
        }
    };

    // Run initialization when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthRefresh);
    } else {
        initAuthRefresh();
    }
})();