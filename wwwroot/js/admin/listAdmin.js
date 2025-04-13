
export async function loadLists() {
    const response = await fetch('/Admin/GetLists');
    const lists = await response.json();
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Lists</h2>
        <button onclick="showAddListModal()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add List
        </button>
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th class="border border-gray-300 p-2">ListID</th>
                    <th class="border border-gray-300 p-2">ListName</th>
                    <th class="border border-gray-300 p-2">BoardID</th>
                    <th class="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${lists.map(list => `
                    <tr>
                        <td class="border border-gray-300 p-2">${list.listID}</td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" value="${list.listName}" onchange="updateList(${list.listID}, this.value)" />
                        </td>
                        <td class="border border-gray-300 p-2">${list.boardID}</td>
                        <td class="border border-gray-300 p-2">
                            <button onclick="deleteList(${list.listID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export async function updateList(listID, listName) {
    await fetch('/Admin/UpdateList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listID, listName })
    });
    alert('List updated successfully!');
    loadLists();
}

export async function deleteList(listID) {
    if (!confirm('Are you sure you want to delete this list?')) return;
    await fetch('/Admin/DeleteList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listID })
    });
    alert('List deleted successfully!');
    loadLists();
}

export function showAddListModal() {
    const modal = document.getElementById('addListModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddListModal() {
    const modal = document.getElementById('addListModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addList() {
    const listName = document.getElementById('newListName').value.trim();
    const boardID = document.getElementById('newListBoardID').value.trim();

    if (!listName || !boardID) {
        alert('All fields are required!');
        return;
    }

    await fetch('/Admin/AddList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listName, boardID })
    });

    alert('List added successfully!');
    closeAddListModal();
    loadLists();
}