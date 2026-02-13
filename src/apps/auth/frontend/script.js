// Frontend JavaScript for signup and login
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupMessage = document.getElementById('signup-message');
    const loginMessage = document.getElementById('login-message');

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signupForm.elements['signup-email'].value;
            const password = signupForm.elements['signup-password'].value;

            signupMessage.textContent = 'Signing up...';
            signupMessage.style.color = 'blue';

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    signupMessage.textContent = data.message || 'Signup successful! Please check your email for verification.';
                    signupMessage.className = 'success'; // Apply success class
                    signupForm.reset();
                    localStorage.setItem('signupEmail', email);
                } else {
                    signupMessage.textContent = data.error || 'Signup failed.';
                    signupMessage.className = 'error'; // Apply error class
                }
            } catch (error) {
                console.error('Error during signup:', error);
                signupMessage.textContent = 'An unexpected error occurred during signup.';
                signupMessage.className = 'error'; // Apply error class
            }
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.elements['login-email'].value;
            const password = loginForm.elements['login-password'].value;

            loginMessage.textContent = 'Logging in...';
            loginMessage.className = ''; // Clear previous classes

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    loginMessage.textContent = 'Login successful! Redirecting...';
                    loginMessage.className = 'success'; // Apply success class
                    loginForm.reset();

                    // Store session tokens in cookies (valid for 1 week)
                    const maxAge = 60 * 60 * 24 * 7;
                    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
                    document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

                    // Redirect to a protected part of the app after a short delay for the user to see the message
                    setTimeout(() => { window.location.href = '/app'; }, 1000);
                } else {
                    loginMessage.textContent = data.error || 'Login failed. Please check your credentials.';
                    loginMessage.className = 'error'; // Apply error class
                }
            } catch (error) {
                console.error('Error during login:', error);
                loginMessage.textContent = 'An unexpected error occurred during login.';
                loginMessage.className = 'error'; // Apply error class
            }
        });
    }
});
