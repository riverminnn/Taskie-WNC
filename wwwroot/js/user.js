let allBoardsData = null;

function openNewBoardModal() {
    document.getElementById('newBoardModal').classList.remove('hidden');
    document.getElementById('newBoardModal').classList.add('flex');
}

function closeNewBoardModal() {
    document.getElementById('newBoardModal').classList.add('hidden');
    document.getElementById('newBoardModal').classList.remove('flex');
}

async function createBoard() {
    const boardTitle = document.getElementById('boardTitle').value.trim();
    const boardTitleError = document.getElementById('boardTitleError');

    if (!boardTitle) {
        boardTitleError.classList.remove('hidden');
        return;
    }

    boardTitleError.classList.add('hidden');

    try {
        const response = await fetch('/User/CreateBoard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardName: boardTitle }),
        });
        console.log(JSON.stringify({ boardName: boardTitle }));
        const data = await response.json();

        if (data.success) {
            closeNewBoardModal();
            fetchBoards(); // Refresh the board list
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error creating board:', error);
    }
}

async function fetchBoards() {
    try {
        const response = await fetch('/User/GetBoards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

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

// Apply current filters and sorting options to the boards data
function applyFiltersAndSort() {
    if (!allBoardsData) return;

    const searchTerm = document.getElementById('searchBoards').value.toLowerCase().trim();
    const sortOption = document.getElementById('sort').value;

    // Create a deep copy of the data to avoid modifying the original
    const filteredData = JSON.parse(JSON.stringify(allBoardsData));

    // Apply search filter
    if (searchTerm) {
        // Filter owned boards
        filteredData.ownedBoards = filteredData.ownedBoards.filter(board =>
            board.boardName.toLowerCase().includes(searchTerm)
        );

        // Filter shared boards
        filteredData.sharedBoards = filteredData.sharedBoards.filter(board =>
            board.boardName.toLowerCase().includes(searchTerm)
        );
    }

    // Apply sorting
    sortBoards(filteredData.ownedBoards, sortOption);
    sortBoards(filteredData.sharedBoards, sortOption);

    // Render the filtered and sorted data
    renderBoards(filteredData);
}

// Sort boards based on selected option
function sortBoards(boards, sortOption) {
    if (!boards || boards.length === 0) return;

    switch (sortOption) {
        case 'Alphabetical':
            boards.sort((a, b) => a.boardName.localeCompare(b.boardName));
            break;

        case 'Date created':
            boards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;

        // For "Most recently active" we'll use createdAt as a fallback
        // In a full implementation, you might track last activity date
        case 'Most recently active':
        default:
            boards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
}

function renderBoards(data) {
    const boardsContainer = document.getElementById('boardsContainer');
    boardsContainer.innerHTML = ''; // Clear existing boards

    // Add "Create New Board" button
    boardsContainer.innerHTML += `
        <button onclick="openNewBoardModal()"
            class="flex items-center justify-center bg-gray-200 rounded shadow p-4 cursor-pointer hover:bg-gray-300 h-24 w-full">
            <div class="text-center">
                <span class="block text-lg font-semibold text-gray-600">Create new board</span>
            </div>
        </button>
    `;

    // Section for boards owned by user
    if (data.ownedBoards && data.ownedBoards.length > 0) {
        boardsContainer.innerHTML += `<h2 class="col-span-full mt-6 mb-2 text-lg font-medium">Your boards</h2>`;

        // Render each owned board
        data.ownedBoards.forEach(board => {
            boardsContainer.innerHTML += `
                <div onclick="goToBoardDetail(${board.boardID})"
                    class="bg-gradient-to-r from-slate-200 to-slate-300 cursor-pointer rounded shadow p-4 h-24 w-full flex flex-col justify-between">
                    <span class="block text-lg font-semibold truncate">${board.boardName}</span>
                    <div class="mt-2 text-xs text-gray-600">
                        Created ${formatDate(board.createdAt || new Date())}
                    </div>
                </div>
            `;
        });
    }

    // Section for shared boards
    if (data.sharedBoards && data.sharedBoards.length > 0) {
        boardsContainer.innerHTML += `<h2 class="col-span-full mt-6 mb-2 text-lg font-medium">Shared with you</h2>`;

        // Render each shared board
        data.sharedBoards.forEach(board => {
            boardsContainer.innerHTML += `
                <div onclick="goToBoardDetail(${board.boardID})"
                    class="bg-gradient-to-r from-purple-500 to-purple-700 cursor-pointer text-white rounded shadow p-4 h-24 w-full flex flex-col justify-between">
                    <span class="block text-lg font-semibold truncate">${board.boardName}</span>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-xs">Owner: ${board.ownerName || 'Unknown'}</span>
                    </div>
                </div>
            `;
        });
    }

    // Show empty state if no boards after filtering
    if ((!data.ownedBoards || data.ownedBoards.length === 0) &&
        (!data.sharedBoards || data.sharedBoards.length === 0)) {

        const searchTerm = document.getElementById('searchBoards').value.trim();
        if (searchTerm) {
            boardsContainer.innerHTML += `
                <div class="col-span-full mt-6 text-center text-gray-500">
                    <p>No boards found matching "${searchTerm}"</p>
                </div>
            `;
        }
    }
}

// Add this helper function for formatted dates
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
        const response = await fetch(`/User/GetBoards`, {
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


// Fetch boards when the page loads
// Set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
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
            applyFiltersAndSort();
        });
    }
});