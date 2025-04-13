function toggleDropdown() {
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    // Check if menu is already hidden
    const isHidden = dropdownMenu.classList.contains('hidden');

    // Get screen width and position the dropdown accordingly
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) { // For mobile screens
        // Adjust position for mobile
        dropdownMenu.style.right = '0';
        // Limit width on small screens
        const buttonRect = document.getElementById('profileDropdownButton').getBoundingClientRect();
        dropdownMenu.style.width = Math.min(screenWidth - 20, 280) + 'px';
    }

    if (isHidden) {
        // Show the menu with animation
        dropdownMenu.classList.remove('hidden');
        // Use setTimeout to ensure the transition works
        setTimeout(() => {
            dropdownMenu.classList.remove('scale-95', 'opacity-0');
            dropdownMenu.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        // Hide with animation
        dropdownMenu.classList.remove('scale-100', 'opacity-100');
        dropdownMenu.classList.add('scale-95', 'opacity-0');
        // Wait for animation to finish before hiding
        setTimeout(() => {
            dropdownMenu.classList.add('hidden');
        }, 200);
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdownContainer = document.getElementById('profileDropdownContainer');
    const dropdownMenu = document.getElementById('profileDropdownMenu');

    if (dropdownContainer && dropdownMenu && !dropdownContainer.contains(event.target)) {
        // Hide with animation
        dropdownMenu.classList.remove('scale-100', 'opacity-100');
        dropdownMenu.classList.add('scale-95', 'opacity-0');
        // Wait for animation to finish before hiding
        setTimeout(() => {
            dropdownMenu.classList.add('hidden');
        }, 200);
    }
});

// Add logout functionality
function logout() {
    // Show a loading indicator
    const logoutButton = event.currentTarget;
    const originalContent = logoutButton.innerHTML;
    logoutButton.innerHTML = `
        <div class="flex items-center justify-center w-full">
            <i class="fa-solid fa-spinner fa-spin text-red-400"></i>
            <span class="ml-2">Logging out...</span>
        </div>
    `;

    // Perform the logout
    fetch('/Auth/Logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            } else {
                // Restore button on error
                logoutButton.innerHTML = originalContent;
                alert('Logout failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            logoutButton.innerHTML = originalContent;
            alert('Logout failed. Please try again.');
        });
}

// Adjust dropdown position on window resize
window.addEventListener('resize', function () {
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    if (!dropdownMenu.classList.contains('hidden')) {
        toggleDropdown(); // Close and re-open to adjust position
    }
});