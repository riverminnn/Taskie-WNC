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
        starIcon.className = 'fa-regular fa-star text-[14px]';
    }
}

// Update the starred boards dropdown
function updateStarredBoardsDropdown() {
    const dropdownContent = document.getElementById('starredBoardsList');
    if (!dropdownContent) return;

    const starredBoards = getStarredBoards();

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