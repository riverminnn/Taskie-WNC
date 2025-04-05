function toggleLoginSignup() {
    const loginFields = document.getElementById('loginFields');
    const signupFields = document.getElementById('signupFields');
    const modalTitle = document.getElementById('modalTitle');
    const toggleText = document.getElementById('toggleText');
    const toggleButton = document.getElementById('toggleButton');

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