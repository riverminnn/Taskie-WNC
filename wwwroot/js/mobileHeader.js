// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');

    // Recent boards toggle
    const mobileRecentToggle = document.getElementById('mobile-recent-toggle');
    const mobileRecentContent = document.getElementById('mobile-recent-content');
    const mobileRecentIcon = document.getElementById('mobile-recent-icon');

    // Starred boards toggle
    const mobileStarredToggle = document.getElementById('mobile-starred-toggle');
    const mobileStarredContent = document.getElementById('mobile-starred-content');
    const mobileStarredIcon = document.getElementById('mobile-starred-icon');

    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function () {
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            mobileMenuPanel.classList.remove('-translate-x-full');
        }, 10); // Small delay to ensure transition works
        document.body.classList.add('overflow-hidden'); // Prevent body scrolling
    });

    // Close mobile menu function
    window.closeMobileMenu = function () {
        mobileMenuPanel.classList.add('-translate-x-full');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300); // Wait for transition to complete
        document.body.classList.remove('overflow-hidden');
    };

    // Close button click
    mobileMenuClose.addEventListener('click', closeMobileMenu);

    // Close when clicking outside the panel
    mobileMenu.addEventListener('click', function (e) {
        if (e.target === mobileMenu) {
            closeMobileMenu();
        }
    });

    // Toggle recent boards section
    mobileRecentToggle.addEventListener('click', function () {
        mobileRecentContent.classList.toggle('hidden');
        mobileRecentIcon.classList.toggle('rotate-180');

        // Sync with desktop dropdown content
        const desktopRecentList = document.getElementById('recentBoardsList');
        const mobileRecentList = document.getElementById('mobile-recent-boards-list');

        if (!mobileRecentContent.classList.contains('hidden')) {
            mobileRecentList.innerHTML = desktopRecentList.innerHTML;
        }
    });

    // Toggle starred boards section
    mobileStarredToggle.addEventListener('click', function () {
        mobileStarredContent.classList.toggle('hidden');
        mobileStarredIcon.classList.toggle('rotate-180');

        // Sync with desktop dropdown content
        const desktopStarredList = document.getElementById('starredBoardsList');
        const mobileStarredList = document.getElementById('mobile-starred-boards-list');

        if (!mobileStarredContent.classList.contains('hidden')) {
            mobileStarredList.innerHTML = desktopStarredList.innerHTML;
        }
    });

    // Update mobile menu lists when desktop lists are updated
    // This requires modifying your existing recentBoards.js and starredBoards.js
    // to call these functions after updating their respective lists
    window.updateMobileRecentList = function () {
        const desktopRecentList = document.getElementById('recentBoardsList');
        const mobileRecentList = document.getElementById('mobile-recent-boards-list');
        mobileRecentList.innerHTML = desktopRecentList.innerHTML;
    };

    window.updateMobileStarredList = function () {
        const desktopStarredList = document.getElementById('starredBoardsList');
        const mobileStarredList = document.getElementById('mobile-starred-boards-list');
        mobileStarredList.innerHTML = desktopStarredList.innerHTML;
    };
});