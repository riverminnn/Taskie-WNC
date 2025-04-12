// Maximum number of recent boards to store and display
const MAX_RECENT_BOARDS = 5;

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
 * Cleans up recent boards list by removing boards that no longer exist
 * @returns {Promise<Array>} - Cleaned recent boards array
 */
async function cleanupRecentBoards() {
    const recentBoards = JSON.parse(localStorage.getItem('recentBoards') || '[]');
    if (recentBoards.length === 0) return recentBoards;

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
            const validRecentBoards = recentBoards.filter(board =>
                validBoardIds.includes(parseInt(board.id))
            );

            // Save the cleaned list back to localStorage
            localStorage.setItem('recentBoards', JSON.stringify(validRecentBoards));

            return validRecentBoards;
        }
    } catch (error) {
        console.error('Error cleaning up recent boards:', error);
    }

    return recentBoards;
}

// Track board visit when a board is opened
function trackBoardVisit(boardId, boardName) {
    // Get existing recent boards from localStorage
    let recentBoards = JSON.parse(localStorage.getItem('recentBoards') || '[]');

    // Check if board is already in the list
    const existingIndex = recentBoards.findIndex(board => board.id === boardId);

    // If it exists, remove it so we can add it to the top
    if (existingIndex !== -1) {
        recentBoards.splice(existingIndex, 1);
    }

    // Add the board to the beginning of the array
    recentBoards.unshift({
        id: boardId,
        name: boardName,
        visitedAt: new Date().toISOString()
    });

    // Keep only the latest MAX_RECENT_BOARDS
    recentBoards = recentBoards.slice(0, MAX_RECENT_BOARDS);

    // Store back to localStorage
    localStorage.setItem('recentBoards', JSON.stringify(recentBoards));

    // Update dropdown if it's rendered
    updateRecentBoardsDropdown();
}

// Update the recent boards dropdown with current data
async function updateRecentBoardsDropdown() {
    const dropdownContent = document.getElementById('recentBoardsList');
    if (!dropdownContent) return;

    // Show loading indicator
    dropdownContent.innerHTML = '<div class="py-2 px-3 text-sm text-gray-500 text-center">Loading...</div>';

    // Clean up recent boards to remove deleted ones
    const recentBoards = await cleanupRecentBoards();

    // If no recent boards, show the empty message
    if (recentBoards.length === 0) {
        dropdownContent.innerHTML = `<div class="py-2 px-3 text-sm text-gray-500 text-center">No recent boards</div>`;
        return;
    }

    // Otherwise, populate with recent boards
    dropdownContent.innerHTML = recentBoards.map(board => `
        <a href="/User/${board.id}/${board.name.replace(/\s+/g, '-').toLowerCase()}" 
           class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <div class="flex items-center">
                <div class="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs mr-2">
                    ${board.name.charAt(0).toUpperCase()}
                </div>
                <span class="truncate">${board.name}</span>
            </div>
        </a>
    `).join('');
}

// Initialize the dropdown when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateRecentBoardsDropdown();
});