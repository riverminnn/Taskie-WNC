export async function loadUsersPlus() {
    const response = await fetch('/Admin/GetUsers');
    const users = await response.json();
    console.log(users);

    const contentArea = document.getElementById('contentArea');

    const userGroups = [];
    for (let i = 0; i < users.length; i += 3) {
        userGroups.push(users.slice(i, i + 3));
    }

    contentArea.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Manage Users</h2>
        <button onclick="showAddUserModalPlus()" class="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition-colors">
            Add User
        </button>
        
        <!-- Mobile view (normal table) -->
        <div class="block md:hidden overflow-x-auto">
            <table class="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th class="border border-gray-300 p-2">UserID</th>
                        <th class="border border-gray-300 p-2">Email</th>
                        <th class="border border-gray-300 p-2">FullName</th>
                        <th class="border border-gray-300 p-2">Role</th>
                        <th class="border border-gray-300 p-2">CreatedAt</th>
                        <th class="border border-gray-300 p-2">PasswordHash</th>
                        <th class="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td class="border border-gray-300 p-2">${user.userID}</td>
                            <td class="border border-gray-300 p-2">${user.email}</td>
                            <td class="border border-gray-300 p-2">
                                <input type="text" value="${user.fullName}" onchange="updateUserPlus(${user.userID}, 'FullName', this.value)" />
                            </td>
                            <td class="border border-gray-300 p-2">
                                <select onchange="updateUserPlus(${user.userID}, 'Role', this.value)">
                                    <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
                                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </td>
                            <td class="border border-gray-300 p-2">${new Date(user.createdAt).toLocaleString()}</td>
                            <td class="border border-gray-300 p-2">${user.passwordHash}</td>
                            <td class="border border-gray-300 p-2">
                                <button onclick="deleteUserPlus(${user.userID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Desktop view (3 users per row) -->
        <div class="hidden md:block">
            <table class="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th colspan="3" class="border border-gray-300 p-2 text-center">User Management</th>
                    </tr>
                </thead>
                <tbody>
                    ${userGroups.map(group => `
                        <tr>
                            ${group.map(user => `
                                <td class="border border-gray-300 p-3 w-1/3">
                                    <table class="w-full">
                                        <tr>
                                            <td class="font-bold">ID:</td>
                                            <td>${user.userID}</td>
                                        </tr>
                                        <tr>
                                            <td class="font-bold">Email:</td>
                                            <td>${user.email}</td>
                                        </tr>
                                        <tr>
                                            <td class="font-bold">Name:</td>
                                            <td>
                                                <input type="text" class="w-full border p-1" value="${user.fullName}" 
                                                    onchange="updateUserPlus(${user.userID}, 'FullName', this.value)" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="font-bold">Role:</td>
                                            <td>
                                                <select class="w-full border p-1" onchange="updateUserPlus(${user.userID}, 'Role', this.value)">
                                                    <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
                                                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="font-bold">Created:</td>
                                            <td>${new Date(user.createdAt).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td class="font-bold">PasswordHash:</td>
                                            <td class="border border-gray-300 p-2">${user.passwordHash}</td>
                                        </tr>
                                        <tr>
                                            <td class="font-bold">Actions:</td>
                                            <td>
                                                <button onclick="deleteUserPlus(${user.userID})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export function showAddUserModalPlus() {
    const modal = document.getElementById('addUserModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeAddUserModalPlus() {
    const modal = document.getElementById('addUserModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export async function addUserPlus() {
    const fullName = document.getElementById('newUserFullName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value.trim();
    const verifykey = document.getElementById('verifykey').value.trim();
    const role = document.getElementById('newUserRole').value;

    if (!fullName || !email || !password || !role) {
        alert('All fields are required!');
        return;
    }

    if (verifykey) {
        if (verifykey.length !== 10) {
            alert('Verify key must be exactly 10 characters.');
            return;
        }

        if (!/^[0-9]/.test(verifykey)) {
            alert('Verify key must start with a number.');
            return;
        }

        if (!/^[0-9][a-zA-Z0-9]{9}$/.test(verifykey)) {
            alert('Verify key must contain only alphanumeric characters.');
            return;
        }
    }

    const response = await fetch('/Admin/AddUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role, verifykey })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        closeAddUserModalPlus();
        loadUsersPlus();
    }
}

export async function updateUserPlus(userID, field, value) {
    console.log(JSON.stringify({ userID, field, value }));

    const response = await fetch('/Admin/UpdateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, field, value })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadUsersPlus();
    }
}

export async function deleteUserPlus(userID) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const response = await fetch('/Admin/DeleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        loadUsersPlus();
    }
}