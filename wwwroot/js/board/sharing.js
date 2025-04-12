import { SELECTORS } from './constants.js';
import { canEditBoard } from './permissions.js';

/**
 * Opens the board sharing modal and loads board members.
 */
export function openShareModal() {
    const modal = document.getElementById('shareBoardModal');
    const isEditor = canEditBoard();

    // Hide/show invite form based on role
    const inviteForm = modal.querySelector('.mb-6');
    if (inviteForm) {
        inviteForm.style.display = isEditor ? 'block' : 'none';
    }

    // Change modal title based on role
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = isEditor ? 'Share Board' : 'Board Members';
    }

    // Remove hidden and add flex
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'items-center', 'justify-center');

    // Clear previous data
    document.getElementById('inviteEmail').value = '';
    document.getElementById('inviteError').classList.add('hidden');

    // Load board members
    loadBoardMembers();
}

/**
 * Closes the board sharing modal.
 */
export function closeShareModal() {
    const modal = document.getElementById('shareBoardModal');
    modal.classList.add('hidden');
}

/**
 * Loads board members and renders them in the modal
 */
export async function loadBoardMembers() {
    try {
        const boardId = document.querySelector(SELECTORS.BOARD_ID).value;
        const isOwner = document.querySelector(SELECTORS.USER_ROLE).value === 'Owner';

        const response = await fetch('/BoardMember/GetMembers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(boardId),
        });

        const data = await response.json();

        if (data.success) {
            // Render the board owner
            const ownerInfo = data.owner;
            const ownerElement = document.getElementById('boardOwner');
            ownerElement.innerHTML = `
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-2">
                        ${ownerInfo.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-medium">${ownerInfo.fullname}</p>
                        <p class="text-xs text-gray-500">${ownerInfo.email}</p>
                    </div>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded">Owner</span>
            `;

            // Render board members
            const membersContainer = document.getElementById('boardMembers');
            membersContainer.innerHTML = '';

            if (data.members && data.members.length > 0) {
                data.members.forEach(member => {
                    const memberElement = document.createElement('div');
                    memberElement.className = 'py-2 px-1 border-b flex items-center justify-between';

                    let roleControl;
                    if (isOwner) {
                        // Role dropdown for owner
                        roleControl = `
                            <div class="flex items-center">
                                <select id="role-selector-${member.userID}" 
                                        onchange="handleRoleChange(event, ${member.userID})" 
                                        class="text-xs border rounded px-2 py-1 mr-2 bg-white">
                                    <option value="Editor" ${member.role === 'Editor' ? 'selected' : ''}>Editor</option>
                                    <option value="Viewer" ${member.role === 'Viewer' ? 'selected' : ''}>Viewer</option>
                                </select>
                                <span id="role-success-${member.userID}" class="text-green-500 hidden">
                                    <i class="fas fa-check"></i>
                                </span>
                                <button onclick="removeBoardMember(${member.userID})" 
                                        class="text-red-500 ml-2 hover:text-red-700">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    } else {
                        // Static role display for non-owners
                        roleControl = `
                            <span class="text-xs ${member.role === 'Editor' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} 
                                  font-medium px-2 py-1 rounded">
                                ${member.role}
                            </span>
                        `;
                    }

                    memberElement.innerHTML = `
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium mr-2">
                                ${member.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p class="font-medium">${member.user.fullName}</p>
                                <p class="text-xs text-gray-500">${member.user.email}</p>
                            </div>
                        </div>
                        ${roleControl}
                    `;

                    membersContainer.appendChild(memberElement);
                });
            } else {
                membersContainer.innerHTML = '<p class="text-sm text-gray-500 py-2">No other members yet</p>';
            }
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error loading board members:', error);
    }
}

/**
 * Invites a user to the board.
 */
export async function inviteUser() {
    const email = document.getElementById('inviteEmail').value.trim();
    const role = document.getElementById('inviteRole').value;
    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;
    const errorElement = document.getElementById('inviteError');

    // Simple email validation
    if (!email?.includes('@')) {
        errorElement.textContent = 'Please enter a valid email address';
        errorElement.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/BoardMember/Invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardId, email, role }),
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('inviteEmail').value = '';
            errorElement.classList.add('hidden');
            loadBoardMembers(); // Refresh the member list
        } else {
            errorElement.textContent = data.message;
            errorElement.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error inviting user:', error);
        errorElement.textContent = 'An error occurred while inviting the user';
        errorElement.classList.remove('hidden');
    }
}

/**
 * Removes a member from the board.
 * @param {number} userId - The ID of the user to remove.
 */
export async function removeBoardMember(userId) {
    if (!confirm('Are you sure you want to remove this member from the board?')) {
        return;
    }

    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    try {
        const response = await fetch('/BoardMember/Remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardId, userIdToRemove: userId }),
        });

        const data = await response.json();

        if (data.success) {
            loadBoardMembers(); // Refresh the member list
        } else {
            console.error(data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('Error removing member:', error);
        alert('An error occurred while removing the member');
    }
}

/**
 * Updates a board member's role
 * @param {number} userId - The ID of the user to update
 * @param {string} newRole - The new role (Editor or Viewer)
 */
export async function updateMemberRole(userId, newRole) {
    try {
        const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

        const response = await fetch('/BoardMember/UpdateRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                boardId: boardId,
                userId: userId,
                role: newRole
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Show success indication briefly
            const successIcon = document.getElementById(`role-success-${userId}`);
            if (successIcon) {
                successIcon.classList.remove('hidden');
                setTimeout(() => {
                    successIcon.classList.add('hidden');
                }, 2000);
            }
        } else {
            console.error(data.message);
            // Reset the dropdown to the previous value
            loadBoardMembers();
        }
    } catch (error) {
        console.error('Error updating member role:', error);
    }
}

/**
 * Handles role selection change for a board member
 * @param {Event} event - The change event
 * @param {number} userId - The ID of the user whose role is being changed
 */
export function handleRoleChange(event, userId) {
    const newRole = event.target.value;
    updateMemberRole(userId, newRole);
}