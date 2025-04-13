export async function loadBoards() {
    const response = await fetch('/Admin/GetBoards');
    const boards = await response.json();
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Boards</h2>
        <button onclick="showAddBoardModal()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add Board
        </button>
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th class="border border-gray-300 p-2">BoardID</th>
                    <th class="border border-gray-300 p-2">BoardName</th>
                    <th class="border border-gray-300 p-2">OwnerID</th>
                    <th class="border border-gray-300 p-2">CreatedAt</th>
                    <th class="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${boards.map(board => `
                    <tr>
                        <td class="border border-gray-300 p-2">${board.boardID}</td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" value="${board.boardName}" onchange="updateBoard(${board.boardID}, this.value)" />
                        </td>
                        <td class="border border-gray-300 p-2">${board.userID}</td>
                        <td class="border border-gray-300 p-2">${new Date(board.createdAt).toLocaleString()}</td>
                        <td class="border border-gray-300 p-2">
                            <button onclick="deleteBoard(${board.boardID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export function showAddBoardModal() {
    const modal = document.getElementById('addBoardModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddBoardModal() {
    const modal = document.getElementById('addBoardModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addBoard() {
    const boardName = document.getElementById('newBoardName').value.trim();
    const userID = document.getElementById('newBoardUserID').value.trim();

    if (!boardName || !userID) {
        alert('All fields are required!');
        return;
    }

    const response = await fetch('/Admin/AddBoard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardName, userID })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        closeAddBoardModal();
        loadBoards();
    }
}

export async function updateBoard(boardID, boardName) {
    const response = await fetch('/Admin/UpdateBoard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID, boardName })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadBoards();
    }
}

export async function deleteBoard(boardID) {
    if (!confirm('Are you sure you want to delete this board?')) return;

    const response = await fetch('/Admin/DeleteBoard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadBoards();
    }
}