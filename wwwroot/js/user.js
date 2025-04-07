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
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log(data);
        if (data.success) {
            renderBoards(data); // Now passing the entire data object
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

function renderBoards(data) {
    const boardsContainer = document.querySelector('.grid');
    boardsContainer.innerHTML = ''; // Clear existing boards

    // Add "Create New Board" button
    boardsContainer.innerHTML += `
        <button onclick="openNewBoardModal()"
            class="flex items-center justify-center bg-gray-200 rounded shadow p-4 cursor-pointer hover:bg-gray-300 h-24 w-full max-w-[300px]">
            <div class="text-center">
                <span class="block text-lg font-semibold text-gray-600">Create new board</span>
            </div>
        </button>
    `;

    // Section for boards owned by user
    if (data.ownedBoards && data.ownedBoards.length > 0) {
        boardsContainer.innerHTML += `<h2 class="col-span-4 mt-6 mb-2 text-lg font-medium">Your boards</h2>`;

        // Render each owned board
        data.ownedBoards.forEach(board => {
            boardsContainer.innerHTML += `
                <div onclick="goToBoardDetail(${board.boardID})"
                    class="bg-gradient-to-r from-slate-200 to-slate-300 cursor-pointer rounded shadow p-4 h-24 w-full max-w-[300px]">
                    <span class="block text-lg font-semibold">${board.boardName}</span>
                </div>
            `;
        });
    }

    // Section for shared boards
    if (data.sharedBoards && data.sharedBoards.length > 0) {
        boardsContainer.innerHTML += `<h2 class="col-span-4 mt-6 mb-2 text-lg font-medium">Shared with you</h2>`;

        // Render each shared board
        data.sharedBoards.forEach(board => {
            boardsContainer.innerHTML += `
                <div onclick="goToBoardDetail(${board.boardID})"
                    class="bg-gradient-to-r from-purple-500 to-purple-700 cursor-pointer text-white rounded shadow p-4 h-24 w-full max-w-[300px]">
                    <span class="block text-lg font-semibold">${board.boardName}</span>
                    <span class="block text-xs mt-1">Owner: ${board.ownerName}</span>
                </div>
            `;
        });
    }
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
document.addEventListener('DOMContentLoaded', fetchBoards);