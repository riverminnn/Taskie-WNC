// Ensure the JavaScript runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // If you have a button to trigger the modal, you can add an event listener here
    // Example: document.getElementById('openLoginButton').addEventListener('click', openLoginModal);
});

function togglePassword(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId);

    if (!passwordInput || !toggleIcon) {
        console.error(`Password input or toggle icon not found for inputId: ${inputId}, toggleId: ${toggleId}`);
        return;
    }

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) {
        console.error("Login modal not found!");
        return;
    }
    modal.classList.remove('hidden');
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
            console.error("Modal content not found!");
            return;
        }
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 50); // Slight delay for smooth entrance
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) {
        console.error("Login modal not found!");
        return;
    }
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) {
        console.error("Modal content not found!");
        return;
    }
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); // Match the duration-500 (slightly shorter for smoother feel)
}

function toggleLoginSignup() {
    const loginFields = document.getElementById('loginFields');
    const signupFields = document.getElementById('signupFields');
    const modalTitle = document.getElementById('modalTitle');
    const toggleText = document.getElementById('toggleText');
    const toggleButton = document.getElementById('toggleButton');

    if (!loginFields || !signupFields || !modalTitle || !toggleText || !toggleButton) {
        console.error("One or more elements for toggleLoginSignup not found!");
        return;
    }

    if (loginFields.classList.contains('hidden')) {
        loginFields.classList.remove('hidden');
        signupFields.classList.add('hidden');
        modalTitle.textContent = 'Login with Email';
        toggleText.textContent = "Don't have an account? ";
        toggleButton.textContent = 'Sign Up';
    } else {
        loginFields.classList.add('hidden');
        signupFields.classList.remove('hidden');
        modalTitle.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account? ';
        toggleButton.textContent = 'Login';
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    if (!loginErrorMessage) {
        console.error("Login error message element not found!");
        return;
    }

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
            sessionStorage.setItem('loginSuccess', 'true');
            window.location.href = "User/Home";
        } else {
            loginErrorMessage.textContent = data.message;
            loginErrorMessage.classList.remove('hidden');
        }
    } catch (err) {
        loginErrorMessage.textContent = 'An error occurred. Please try again later.';
        loginErrorMessage.classList.remove('hidden');
        console.error('Error during login:', err);
    }
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long.';
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character (@$!%*?&).';
    }
    if (!hasNumber) {
        return 'Password must contain at least one number.';
    }
    return null; // Password is valid
}

async function signup() {
    const fullname = document.getElementById('signup-fullname').value;
    const signupEmail = document.getElementById('signup-email').value;
    const signupPassword = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirmPassword').value;
    const signupErrorMessage = document.getElementById('signupErrorMessage');



    if (!signupErrorMessage) {
        console.error("Signup error message element not found!");
        return;
    }

    // Clear previous error message
    signupErrorMessage.textContent = '';
    signupErrorMessage.classList.add('hidden');

    // Basic field validation
    if (!fullname || !signupEmail || !signupPassword || !confirmPassword) {
        signupErrorMessage.textContent = 'Please fill in all fields.';
        signupErrorMessage.classList.remove('hidden');
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signupEmail)) {
        signupErrorMessage.textContent = 'Invalid email format.';
        signupErrorMessage.classList.remove('hidden');
        return;
    }

    // Password match validation
    if (signupPassword !== confirmPassword) {
        signupErrorMessage.textContent = 'Passwords do not match.';
        signupErrorMessage.classList.remove('hidden');
        return;
    }

    // Password complexity validation
    const passwordError = validatePassword(signupPassword);
    if (passwordError) {
        signupErrorMessage.textContent = passwordError;
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
            sessionStorage.setItem('signupSuccess', 'true');
            window.location.href = '/';
        } else {
            signupErrorMessage.textContent = result.message || "Registration failed. Please try again.";
            signupErrorMessage.classList.remove('hidden');
        }
    } catch (err) {
        signupErrorMessage.textContent = 'An error occurred. Please try again later.';
        signupErrorMessage.classList.remove('hidden');
        console.error('Error during signup:', err);
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
            sessionStorage.setItem('logoutSuccess', 'true');
            window.location.href = '/';
        } else {
            console.error('Logout failed.');
        }
    } catch (err) {
        console.error('Error during logout:', err);
    }
}