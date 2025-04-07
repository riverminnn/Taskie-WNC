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

        if (data.success) {
            renderBoards(data.boards);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

function renderBoards(boards) {
    const boardsContainer = document.querySelector('.grid');
    boardsContainer.innerHTML = ''; // Clear existing boards

    // Add "Create New Board" button
    boardsContainer.innerHTML += `
        <button onclick="openNewBoardModal()"
            class="flex items-center justify-center bg-gray-200 rounded shadow p-4 cursor-pointer hover:bg-gray-300 h-24 w-full max-w-[300px]">
            <div class="text-center">
                <span class="block text-lg font-semibold text-gray-600">Create new board</span>
                <span class="block text-sm text-gray-500">9 remaining</span>
            </div>
        </button>
    `;

    // Render each board
    boards.forEach(board => {
        boardsContainer.innerHTML += `
            <div onclick="goToBoardDetail(${board.boardID})"
                class="bg-gradient-to-r from-blue-500 to-blue-700 cursor-pointer text-white rounded shadow p-4 h-24 w-full max-w-[300px]">
                <span class="block text-lg font-semibold">${board.boardName}</span>
            </div>
        `;
    });
}

// Function to navigate to BoardDetail
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
            const board = data.boards.find(b => b.boardID === boardID);
            if (board) {
                // Construct the URL with board ID and name
                const boardNameSlug = board.boardName.replace(/\s+/g, '-').toLowerCase();
                window.location.href = `/User/${boardID}/${boardNameSlug}`;
            } else {
                console.error('Board not found.');
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