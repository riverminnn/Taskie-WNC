export async function loadUsers() {
    const response = await fetch('/Admin/GetUsers');
    const users = await response.json();
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Users</h2>
        <button onclick="showAddUserModal()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add User
        </button>
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th class="border border-gray-300 p-2">UserID</th>
                    <th class="border border-gray-300 p-2">Email</th>
                    <th class="border border-gray-300 p-2">FullName</th>
                    <th class="border border-gray-300 p-2">Role</th>
                    <th class="border border-gray-300 p-2">CreatedAt</th>
                    <th class="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td class="border border-gray-300 p-2">${user.userID}</td>
                        <td class="border border-gray-300 p-2">${user.email}</td>
                        <td class="border border-gray-300 p-2">
                            <input type="text" value="${user.fullName}" onchange="updateUser(${user.userID}, 'FullName', this.value)" />
                        </td>
                        <td class="border border-gray-300 p-2">
                            <select onchange="updateUser(${user.userID}, 'Role', this.value)">
                                <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
                                <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </td>
                        <td class="border border-gray-300 p-2">${new Date(user.createdAt).toLocaleString()}</td>
                        <td class="border border-gray-300 p-2">
                            <button onclick="deleteUser(${user.userID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

export function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addUser() {
    const fullName = document.getElementById('newUserFullName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value.trim();
    const role = document.getElementById('newUserRole').value;

    if (!fullName || !email || !password || !role) {
        alert('All fields are required!');
        return;
    }

    const response = await fetch('/Admin/AddUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        closeAddUserModal();
        loadUsers();
    }
}

export async function updateUser(userID, field, value) {
    console.log(JSON.stringify({ userID, field, value }));

    const response = await fetch('/Admin/UpdateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, field, value })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadUsers();
    }
}

export async function deleteUser(userID) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const response = await fetch('/Admin/DeleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadUsers();
    }
}