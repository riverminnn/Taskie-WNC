async function loadUserProfile() {
    try {
        const response = await fetch('/User/GetProfile');
        const userData = await response.json();

        if (userData) {
            document.getElementById('fullName').value = userData.fullName || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile information');
    }
}

async function updateProfile() {
    const fullName = document.getElementById('fullName').value.trim();

    if (!fullName) {
        showError('Full name cannot be empty');
        return;
    }

    try {
        const response = await fetch('/User/UpdateProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(result.message || 'Profile updated successfully');
        } else {
            showError(result.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('An error occurred while updating your profile');
    }
}

function showSuccess(message) {
    document.getElementById('successAlertTitle').textContent = 'Success';
    document.getElementById('successAlertMessage').textContent = message;
    showAlert('successAlert');
}

function showError(message) {
    document.getElementById('errorAlertTitle').textContent = 'Error';
    document.getElementById('errorAlertMessage').textContent = message;
    showAlert('errorAlert');
}

function showAlert(alertId) {
    const alert = document.getElementById(alertId);
    alert.classList.remove('hidden', '-translate-x-full', 'opacity-0', 'scale-95');
    alert.classList.add('flex', 'translate-x-0', 'opacity-100', 'scale-100');

    setTimeout(() => {
        hideAlert(alertId);
    }, 5000);
}

// Add this function to toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleIcon = document.getElementById(inputId + 'Toggle');

    if (input.type === 'password') {
        input.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Add this password validation function
function validatePassword(password) {
    const validationResults = {
        valid: true,
        errors: []
    };

    // Check minimum length (8 characters)
    if (password.length < 8) {
        validationResults.valid = false;
        validationResults.errors.push("Password must be at least 8 characters long");
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        validationResults.valid = false;
        validationResults.errors.push("Password must include at least one uppercase letter");
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        validationResults.valid = false;
        validationResults.errors.push("Password must include at least one lowercase letter");
    }

    // Check for numbers
    if (!/\d/.test(password)) {
        validationResults.valid = false;
        validationResults.errors.push("Password must include at least one number");
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        validationResults.valid = false;
        validationResults.errors.push("Password must include at least one special character");
    }

    return validationResults;
}

// Update the changePassword function with detailed validation
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordErrorList = document.getElementById('passwordErrors');

    // Clear previous errors
    passwordErrorList.innerHTML = '';
    passwordErrorList.classList.add('hidden');

    // Basic required field validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('All password fields are required');
        return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }

    // Detailed password validation
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
        // Display all validation errors in the error list
        passwordErrorList.classList.remove('hidden');
        validation.errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            passwordErrorList.appendChild(li);
        });
        return;
    }

    try {
        const response = await fetch('/User/ChangePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(result.message || 'Password changed successfully');
            document.getElementById('changePasswordForm').reset();
            passwordErrorList.classList.add('hidden');
        } else {
            showError(result.message || 'Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showError('An error occurred while changing your password');
    }
}

// Add input event listeners for real-time feedback
document.addEventListener('DOMContentLoaded', function () {
    loadUserProfile();

    // Set up password strength indicators and validation
    const newPasswordInput = document.getElementById('newPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const progressBar = document.getElementById('passwordStrengthBar');

    newPasswordInput.addEventListener('input', function () {
        const password = this.value;
        const validation = validatePassword(password);

        // Update the validation icons
        updateValidationIcons(password);

        // Update password strength meter
        if (password.length === 0) {
            passwordStrength.textContent = '';
            progressBar.style.width = '0%';
            progressBar.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500');
        } else if (password.length < 8) {
            passwordStrength.textContent = 'Weak';
            progressBar.style.width = '25%';
            progressBar.classList.add('bg-red-500');
            progressBar.classList.remove('bg-yellow-500', 'bg-green-500');
        } else if (validation.errors.length >= 2) {
            passwordStrength.textContent = 'Medium';
            progressBar.style.width = '50%';
            progressBar.classList.add('bg-yellow-500');
            progressBar.classList.remove('bg-red-500', 'bg-green-500');
        } else if (validation.errors.length === 1) {
            passwordStrength.textContent = 'Strong';
            progressBar.style.width = '75%';
            progressBar.classList.add('bg-green-500');
            progressBar.classList.remove('bg-red-500', 'bg-yellow-500');
        } else {
            passwordStrength.textContent = 'Very Strong';
            progressBar.style.width = '100%';
            progressBar.classList.add('bg-green-500');
            progressBar.classList.remove('bg-red-500', 'bg-yellow-500');
        }
    });

    // For password matching validation
    const confirmInput = document.getElementById('confirmPassword');
    confirmInput.addEventListener('input', function () {
        const newPassword = document.getElementById('newPassword').value;
        const confirmIcon = document.getElementById('confirmPasswordIcon');

        if (this.value.length === 0) {
            confirmIcon.innerHTML = '';
        } else if (this.value === newPassword) {
            confirmIcon.innerHTML = '<i class="fas fa-check text-green-500"></i>';
        } else {
            confirmIcon.innerHTML = '<i class="fas fa-times text-red-500"></i>';
        }
    });

    // Scroll to sections when clicking on nav links as before...
});

function updateValidationIcons(password) {
    // Update each validation icon
    document.getElementById('lengthIcon').innerHTML =
        password.length >= 8
            ? '<i class="fas fa-check text-green-500"></i>'
            : '<i class="fas fa-times text-red-500"></i>';

    document.getElementById('uppercaseIcon').innerHTML =
        /[A-Z]/.test(password)
            ? '<i class="fas fa-check text-green-500"></i>'
            : '<i class="fas fa-times text-red-500"></i>';

    document.getElementById('lowercaseIcon').innerHTML =
        /[a-z]/.test(password)
            ? '<i class="fas fa-check text-green-500"></i>'
            : '<i class="fas fa-times text-red-500"></i>';

    document.getElementById('numberIcon').innerHTML =
        /\d/.test(password)
            ? '<i class="fas fa-check text-green-500"></i>'
            : '<i class="fas fa-times text-red-500"></i>';

    document.getElementById('specialIcon').innerHTML =
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
            ? '<i class="fas fa-check text-green-500"></i>'
            : '<i class="fas fa-times text-red-500"></i>';
}