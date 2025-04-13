/**
 * starredBoards.js - Manages starred boards functionality
 */

// Get starred boards from localStorage
function getStarredBoards() {
    return JSON.parse(localStorage.getItem('starredBoards') || '[]');
}

// Save starred boards to localStorage
function saveStarredBoards(boards) {
    localStorage.setItem('starredBoards', JSON.stringify(boards));
}

// Check if a board is starred
function isBoardStarred(boardId) {
    const starredBoards = getStarredBoards();
    return starredBoards.some(board => board.id === parseInt(boardId));
}

/**
 * Validates if a board exists on the server
 * @param {number} boardId - The ID of the board to check
 * @returns {Promise<boolean>} - True if board exists, false otherwise
 */
async function validateBoardExists(boardId) {
    try {
        const response = await fetch('/Board/GetBoards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            // Check if board exists in either owned or shared boards
            return (
                (data.ownedBoards?.some(b => b.boardID === boardId)) ||
                (data.sharedBoards?.some(b => b.boardID === boardId))
            );
        }
        return false;
    } catch (error) {
        console.error('Error validating board:', error);
        return false;
    }
}

/**
 * Cleans up starred boards list by removing boards that no longer exist
 * @returns {Promise<Array>} - Cleaned starred boards array
 */
async function cleanupStarredBoards() {
    const starredBoards = getStarredBoards();
    if (starredBoards.length === 0) return starredBoards;

    // Get all board IDs from the server for validation
    try {
        const response = await fetch('/Board/GetBoards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            // Collect all valid board IDs from owned and shared boards
            const validBoardIds = [
                ...(data.ownedBoards || []).map(b => b.boardID),
                ...(data.sharedBoards || []).map(b => b.boardID)
            ];

            // Filter out boards that don't exist
            const validStarredBoards = starredBoards.filter(board =>
                validBoardIds.includes(parseInt(board.id))
            );

            // Save the cleaned list back to localStorage
            saveStarredBoards(validStarredBoards);

            return validStarredBoards;
        }
    } catch (error) {
        console.error('Error cleaning up starred boards:', error);
    }

    return starredBoards;
}

// Toggle star status for a board
function toggleStarredStatus(boardId, boardName) {
    const starredBoards = getStarredBoards();
    const parsedBoardId = parseInt(boardId);
    const index = starredBoards.findIndex(board => board.id === parsedBoardId);

    if (index !== -1) {
        // Remove from starred boards
        starredBoards.splice(index, 1);
        saveStarredBoards(starredBoards);
        return false; // Not starred anymore
    } else {
        // Add to starred boards
        starredBoards.push({
            id: parsedBoardId,
            name: boardName,
            starredAt: new Date().toISOString()
        });
        saveStarredBoards(starredBoards);
        return true; // Starred
    }
}

// Update the star icon in the current board view
function updateStarIcon(isStarred) {
    const starButton = document.getElementById('starred');
    if (!starButton) return;

    const starIcon = starButton.querySelector('i');
    if (isStarred) {
        starIcon.className = 'fa-solid fa-star text-[14px] text-yellow-500';
    } else {
        starIcon.className = 'fa-regular fa-star text-[14px] text-white';
    }
}

// Update the starred boards dropdown
async function updateStarredBoardsDropdown() {
    const dropdownContent = document.getElementById('starredBoardsList');
    if (!dropdownContent) return;

    // Show loading indicator
    dropdownContent.innerHTML = '<div class="py-2 px-3 text-sm text-gray-500 text-center">Loading...</div>';

    // Clean up starred boards to remove deleted ones
    const starredBoards = await cleanupStarredBoards();

    if (starredBoards.length === 0) {
        dropdownContent.innerHTML = `<div class="py-2 px-3 text-sm text-gray-500 text-center">No starred boards</div>`;
        return;
    }

    // Sort by most recently starred
    starredBoards.sort((a, b) => new Date(b.starredAt) - new Date(a.starredAt));

    // Populate dropdown with starred boards
    dropdownContent.innerHTML = starredBoards.map(board => `
        <a href="/User/${board.id}/${board.name.replace(/\s+/g, '-').toLowerCase()}" 
           class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <div class="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs mr-2">
                <i class="fa-solid fa-star text-xs"></i>
            </div>
            <span class="truncate">${board.name}</span>
        </a>
    `).join('');
}

// Initialize starred boards functionality
document.addEventListener('DOMContentLoaded', () => {
    updateStarredBoardsDropdown();

    // Check if we're on a board detail page and update star icon
    const boardIdElement = document.getElementById('boardId');
    if (boardIdElement) {
        const boardId = boardIdElement.value;
        const isStarred = isBoardStarred(boardId);
        updateStarIcon(isStarred);
    }
});