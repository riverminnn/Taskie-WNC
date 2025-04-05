async function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

async function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // Clear previous error message
    loginErrorMessage.textContent = '';
    loginErrorMessage.classList.add('hidden');

    if (!email || !password) {
        loginErrorMessage.textContent = 'Please fill in both email and password.';
        loginErrorMessage.classList.remove('hidden');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    try {
        const response = await fetch('/Home/Login', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await response.json();

        if (data.success) {
            closeLoginModal();
            location.reload();
        } else {
            loginErrorMessage.textContent = data.message;
            loginErrorMessage.classList.remove('hidden');
        }
    } catch (err) {
        loginErrorMessage.textContent = 'An error occurred. Please try again later.';
        loginErrorMessage.classList.remove('hidden');
        console.error('Error:', err);
    }
}

async function signup() {
    const fullname = document.getElementById('signup-fullname').value;
    const signupEmail = document.getElementById('signup-email').value;
    const signupPassword = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirmPassword').value;
    const signupErrorMessage = document.getElementById('signupErrorMessage');

    // Clear previous error message
    signupErrorMessage.textContent = '';
    signupErrorMessage.classList.add('hidden');

    if (!fullname || !signupEmail || !signupPassword || !confirmPassword) {
        signupErrorMessage.textContent = 'Please fill in all fields.';
        signupErrorMessage.classList.remove('hidden');
        return;
    }

    if (signupPassword !== confirmPassword) {
        signupErrorMessage.textContent = 'Passwords do not match.';
        signupErrorMessage.classList.remove('hidden');
        return;
    }

    const formData = new URLSearchParams();
    formData.append('fullname', fullname);
    formData.append('email', signupEmail);
    formData.append('password', signupPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
        const response = await fetch('/Home/Register', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = await response.json();

        if (result.success) {
            closeLoginModal();
            location.reload();
        } else {
            signupErrorMessage.textContent = result.message || "Registration failed. Please try again.";
            signupErrorMessage.classList.remove('hidden');
        }
    } catch (err) {
        signupErrorMessage.textContent = 'An error occurred. Please try again later.';
        signupErrorMessage.classList.remove('hidden');
        console.error('Error:', err);
    }
}

async function logout() {
    try {
        const response = await fetch('/Home/Logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.ok) {
            location.reload(); // Reload the page or redirect to the homepage
        } else {
            console.error('Logout failed.');
        }
    } catch (err) {
        console.error('Error during logout:', err);
    }
}