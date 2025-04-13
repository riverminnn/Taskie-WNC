
export async function loadBoardMembers() {
    const response = await fetch('/Admin/GetAllBoardMembers');
    const boardMembers = await response.json();
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Board Members</h2>
        <button onclick="showAddBoardMemberModal()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add Board Member
        </button>
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th class="border border-gray-300 p-2">MemberID</th>
                    <th class="border border-gray-300 p-2">Board</th>
                    <th class="border border-gray-300 p-2">User</th>
                    <th class="border border-gray-300 p-2">Role</th>
                    <th class="border border-gray-300 p-2">Added At</th>
                    <th class="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${boardMembers.map(member => `
                    <tr>
                        <td class="border border-gray-300 p-2">${member.memberID}</td>
                        <td class="border border-gray-300 p-2">${member.boardName} (ID: ${member.boardID})</td>
                        <td class="border border-gray-300 p-2">${member.userFullName} (ID: ${member.userID})</td>
                        <td class="border border-gray-300 p-2">
                            <select onchange="updateBoardMemberRole(${member.boardID}, ${member.userID}, this.value)">
                                <option value="Viewer" ${member.role === 'Viewer' ? 'selected' : ''}>Viewer</option>
                                <option value="Editor" ${member.role === 'Editor' ? 'selected' : ''}>Editor</option>
                            </select>
                        </td>
                        <td class="border border-gray-300 p-2">${new Date(member.addedAt).toLocaleString()}</td>
                        <td class="border border-gray-300 p-2">
                            <button onclick="deleteBoardMember(${member.boardID}, ${member.userID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export function showAddBoardMemberModal() {
    const modal = document.getElementById('addBoardMemberModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddBoardMemberModal() {
    const modal = document.getElementById('addBoardMemberModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addBoardMember() {
    const boardID = document.getElementById('newBoardMemberBoardID').value.trim();
    const userID = document.getElementById('newBoardMemberUserID').value.trim();
    const role = document.getElementById('newBoardMemberRole').value;

    if (!boardID || !userID) {
        alert('Board ID and User ID are required!');
        return;
    }

    const response = await fetch('/Admin/AddBoardMember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID: parseInt(boardID), userID: parseInt(userID), role })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        closeAddBoardMemberModal();
        loadBoardMembers();
    }
}

export async function updateBoardMemberRole(boardID, userID, role) {
    const response = await fetch('/Admin/UpdateBoardMemberRole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID, userID, role })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadBoardMembers();
    }
}

export async function deleteBoardMember(boardID, userID) {
    if (!confirm('Are you sure you want to remove this member from the board?')) return;

    const response = await fetch('/Admin/DeleteBoardMember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardID, userID })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadBoardMembers();
    }
}