let allBoardsData = null;

/**
 * Determines if the current page is the User Home page
 * @returns {boolean} True if on User Home page
 */
function isUserHomePage() {
    return window.location.pathname === '/User/Home' ||
        window.location.pathname === '/User' ||
        window.location.pathname === '/User/';
}

/**
 * Opens the new board modal
 */
function openNewBoardModal() {
    const modal = document.getElementById('newBoardModal');
    document.getElementById('newBoardModal').classList.add('flex');
    modal.classList.remove('hidden');

    // Focus the input field after a short delay to ensure modal is visible
    setTimeout(() => {
        const input = document.getElementById('boardNameInput');
        if (input) {
            input.focus();
        }
    }, 100);
}

/**
 * Closes the new board modal
 */
function closeNewBoardModal() {
    const modal = document.getElementById('newBoardModal');
    document.getElementById('newBoardModal').classList.remove('flex');
    modal.classList.add('hidden');

    // Clear input
    const input = document.getElementById('boardNameInput');
    if (input) {
        input.value = '';
    }
}

/**
 * Creates a new board
 */
async function createBoard() {
    const boardNameInput = document.getElementById('boardTitle');
    const boardName = boardNameInput.value.trim();

    if (!boardName) {
        alert('Board name is required!');
        return;
    }

    try {
        const response = await fetch('/Board/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardName }),
        });

        const data = await response.json();

        if (data.success) {
            closeNewBoardModal();

            // Check if we're on the User Home page
            if (isUserHomePage()) {
                fetchBoards(); // Refresh the boards list if we're on the home page
            } else {
                // If not on home page, redirect to home page
                window.location.href = '/User/Home';
            }
        } else {
            alert(data.message || 'Failed to create board');
        }
    } catch (error) {
        console.error('Error creating board:', error);
        alert('An error occurred while creating the board');
    }
}

/**
 * Fetches all boards for the current user
 */
async function fetchBoards() {
    // Only fetch boards on User Home page
    if (!isUserHomePage()) {
        return;
    }
    try {
        const response = await fetch('/Board/GetBoards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        console.log(data);


        if (data.success) {
            // Store the data globally for filtering/sorting
            allBoardsData = data;

            // Apply any active filters/sorting
            applyFiltersAndSort();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

/**
 * Gets recent boards from localStorage
 * @param {Object} filteredData - The data containing all boards
 * @returns {Array} - Array of recent boards
 */
function getRecentBoards(filteredData) {
    try {
        const recentBoardsFromStorage = JSON.parse(localStorage.getItem('recentBoards') || '[]');
        if (recentBoardsFromStorage.length === 0) return [];

        // Get all boards (from either owned or shared)
        const allBoardsArray = [...(filteredData.ownedBoards || []), ...(filteredData.sharedBoards || [])];

        // Filter to just the boards that are in our recent list
        const recentBoardIds = recentBoardsFromStorage.map(rb => parseInt(rb.id));
        const result = allBoardsArray.filter(board =>
            recentBoardIds.includes(board.boardID)
        );

        // Sort by recent visit order
        result.sort((a, b) => {
            const aIndex = recentBoardIds.indexOf(a.boardID);
            const bIndex = recentBoardIds.indexOf(b.boardID);
            return aIndex - bIndex;
        });

        return result;
    } catch (error) {
        console.error('Error getting recent boards:', error);
        return [];
    }
}

/**
 * Unifies boards data for consistent handling
 * @param {Object} filteredData - The data to unify
 * @returns {Object} - Data with unified boards
 */
function unifyBoardsData(filteredData) {
    if (filteredData.boards) return filteredData;

    // Create a deep copy to avoid modifying the original
    const result = JSON.parse(JSON.stringify(filteredData));

    // Combine owned and shared boards into a single array
    const ownedBoards = result.ownedBoards || [];
    const sharedBoards = result.sharedBoards || [];

    // Mark ownership status
    ownedBoards.forEach(board => board.isOwner = true);
    sharedBoards.forEach(board => board.isOwner = false);

    // Create a unified array
    result.boards = [...ownedBoards, ...sharedBoards];

    return result;
}

/**
 * Sorts boards based on the given option
 * @param {Array} boards - The boards to sort
 * @param {string} sortOption - The sorting option
 * @returns {Array} - Sorted boards
 */
function sortBoards(boards, sortOption) {
    if (boards.length === 0) return boards;

    if (sortOption === 'Alphabetical') {
        return [...boards].sort((a, b) => a.boardName.localeCompare(b.boardName));
    } else if (sortOption === 'Date created') {
        return [...boards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else { // Most recently active
        return [...boards].sort((a, b) => new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt));
    }
}

/**
 * Applies filters and sorting to the boards
 */
function applyFiltersAndSort() {
    // Only run this function on the User Home page or if required elements exist
    if (!isUserHomePage() || !allBoardsData) return;

    const searchTerm = document.getElementById('searchBoards').value.toLowerCase().trim();
    const sortOption = document.getElementById('sort').value;

    // Unify boards data for consistent handling
    let filteredData = unifyBoardsData(allBoardsData);

    // Filter based on active category
    let boardsToShow = [];

    if (window.activeFilter === 'all') {
        boardsToShow = filteredData.boards;
    } else if (window.activeFilter === 'recent') {
        boardsToShow = getRecentBoards(filteredData);
    } else if (window.activeFilter === 'owned') {
        boardsToShow = filteredData.ownedBoards || filteredData.boards.filter(board => board.isOwner);
    } else if (window.activeFilter === 'shared') {
        boardsToShow = filteredData.sharedBoards || filteredData.boards.filter(board => !board.isOwner);
    }

    // Ensure boardsToShow is an array
    boardsToShow = Array.isArray(boardsToShow) ? boardsToShow : [];

    // Apply search filter
    if (searchTerm) {
        boardsToShow = boardsToShow.filter(board =>
            board.boardName.toLowerCase().includes(searchTerm));
    }

    // Apply sorting
    boardsToShow = sortBoards(boardsToShow, sortOption);

    // Render the filtered and sorted boards
    renderBoards(boardsToShow);
}

/**
 * Filter boards by category
 * @param {string} category - The category to filter by (all, recent, owned, shared)
 */
function filterBoards(category) {
    // Update active button visual state
    document.querySelectorAll('[id$="-boards-btn"]').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-700', 'border-blue-500');
        btn.classList.add('bg-white', 'text-gray-600', 'border-gray-300');
    });

    const buttonId = `${category}-boards-btn`;
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-500');
        activeButton.classList.remove('bg-white', 'text-gray-600', 'border-gray-300');
    }

    // Apply the filter
    window.activeFilter = category;
    applyFiltersAndSort();
}

/**
 * Trigger filtering when sort option changes
 */
function applySorting() {
    applyFiltersAndSort();
}

/**
 * Renders boards to the UI
 * @param {Array} boards - The boards to render
 */
function renderBoards(boards) {
    const boardsContainer = document.getElementById('boardsContainer');
    boardsContainer.innerHTML = '';

    if (!boards || boards.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');

    // Render each board with enhanced UI
    boards.forEach(board => {
        const boardCard = document.createElement('div');
        boardCard.className = 'board-card bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-blue-400';

        // Determine board color based on role
        let headerClass = 'bg-blue-500';
        let roleTag = '';

        if (!board.isOwner) {
            headerClass = 'bg-purple-500';
            roleTag = `<span class="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">Shared</span>`;
        }

        const createdDate = new Date(board.createdAt).toLocaleDateString();

        boardCard.innerHTML = `
            <div class="${headerClass} h-2 w-full"></div>
            <div class="p-4 flex-grow flex flex-col cursor-pointer" onclick="goToBoardDetail(${board.boardID})">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-medium text-gray-800">${board.boardName}</h3>
                    ${roleTag}
                </div>
               
                <div class="mt-auto flex justify-between items-center">
                    <div class="flex items-center">
                         <p class="text-sm text-gray-500 mb-3">Created ${createdDate}</p>
                    </div>
                </div>
            </div>
        `;

        boardsContainer.appendChild(boardCard);
    });
}

/**
 * Format date for display
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Navigates to a board's detail page
 * @param {number} boardID - The ID of the board to view
 */
async function goToBoardDetail(boardID) {
    try {
        // Fetch the board details to get the board name
        const response = await fetch(`/Board/GetBoards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            // Search for the board in both owned and shared boards
            const board =
                (data.ownedBoards?.find(b => b.boardID === boardID)) ||
                data.sharedBoards?.find(b => b.boardID === boardID);

            if (board) {
                // Construct the URL with board ID and name
                const boardNameSlug = board.boardName.replace(/\s+/g, '-').toLowerCase();
                window.location.href = `/User/${boardID}/${boardNameSlug}`;
            } else {
                console.error('Board not found.');
                alert('Board not found');
            }
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error navigating to board detail:', error);
    }
}

// Set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize filter state
    window.activeFilter = 'all';

    // Fetch boards initially
    fetchBoards();

    // Set up search input event listener
    const searchInput = document.getElementById('searchBoards');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFiltersAndSort();
        });
    }

    // Set up sort dropdown event listener
    const sortDropdown = document.getElementById('sort');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', () => {
            applySorting();
        });
    }
});