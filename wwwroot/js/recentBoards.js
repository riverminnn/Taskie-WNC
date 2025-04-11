// Maximum number of recent boards to store and display
const MAX_RECENT_BOARDS = 5;

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
function updateRecentBoardsDropdown() {
    const dropdownContent = document.getElementById('recentBoardsList');
    if (!dropdownContent) return;

    // Get recent boards from localStorage
    const recentBoards = JSON.parse(localStorage.getItem('recentBoards') || '[]');

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