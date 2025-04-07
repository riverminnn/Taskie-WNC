/**
 * Shows an alert with the specified content.
 * @param {string} alertId - The ID of the alert element (e.g., 'successAlert', 'errorAlert').
 * @param {string} title - The title of the alert (e.g., 'Success', 'Error').
 * @param {string} message - The message to display in the alert.
 */
function showAlert(alertId, title, message) {
    const alert = document.getElementById(alertId);
    const alertTitle = document.getElementById(`${alertId}Title`);
    const alertMessage = document.getElementById(`${alertId}Message`);

    if (!alert || !alertTitle || !alertMessage) {
        console.error(`Alert with ID "${alertId}" or its content elements are missing.`);
        return;
    }

    // Set the alert content
    alertTitle.textContent = title;
    alertMessage.textContent = message;

    // Show the alert with a slight delay (e.g., 200ms)
    setTimeout(() => {
        alert.classList.remove('hidden', '-translate-x-full', 'opacity-0', 'scale-95', 'shadow-none');
        alert.classList.add('translate-x-0', 'opacity-100', 'scale-100', 'shadow-md');

        // Automatically hide the alert after 3 seconds
        setTimeout(() => hideAlert(alertId), 3000);
    }, 200); // 200ms delay before showing
}

/**
 * Hides the specified alert.
 * @param {string} alertId - The ID of the alert element to hide.
 */
function hideAlert(alertId) {
    const alert = document.getElementById(alertId);

    if (!alert) {
        console.error(`Alert with ID "${alertId}" is missing.`);
        return;
    }

    // Animate out
    alert.classList.remove('translate-x-0', 'opacity-100', 'scale-100', 'shadow-md');
    alert.classList.add('-translate-x-full', 'opacity-0', 'scale-95', 'shadow-none');

    // Hide after animation completes
    setTimeout(() => alert.classList.add('hidden'), 300); // Match the duration-300
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('logoutSuccess') === 'true') {
        showAlert('successAlert', 'Logout successful', 'You have logged out successfully.');
        sessionStorage.removeItem('logoutSuccess');
    }
    if (sessionStorage.getItem('signupSuccess') === 'true') {
        showAlert('successAlert', 'Signup successful', 'You have signed up successfully.');
        sessionStorage.removeItem('signupSuccess');
    }
    if (sessionStorage.getItem('loginSuccess') === 'true') {
        showAlert('successAlert', 'Login successful', 'You have logged in successfully.');
        sessionStorage.removeItem('loginSuccess');
    }
});