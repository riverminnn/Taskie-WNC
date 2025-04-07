/**
 * boardDetail.js - Board detail page functionality
 *
 * TABLE OF CONTENTS:
 * ------------------
 * 1. Constants and Config ................ Line 15
 * 2. Modal Handling Functions ............ Line 30
 * 3. List and Card Fetching .............. Line 110
 * 4. List Management ..................... Line 280
 * 5. Card Management ..................... Line 370 
 * 6. Permission Management ............... Line 470
 * 7. Board Sharing ...................... Line 560
 * 8. Event Handlers ..................... Line 730
 * 9. Initialization ..................... Line 840
 */

//==============================================================================
// 1. CONSTANTS AND CONFIG
//==============================================================================

/**
 * Selectors for frequently accessed DOM elements
 */
const SELECTORS = {
    BOARD_ID: '#boardId',
    BOARD_NAME: '#boardName',
    LISTS_CONTAINER: '.lists-col',
    LIST_SETTINGS: '[id^="list-settings-"]',
    CARD_BUTTONS: '[id^="addCardButton-"]',
    LIST_NAMES: '[id^="list-name-"]',
    USER_ROLE: '#userRole'
};

/**
 * Status constants
 */
const STATUS = {
    DONE: 'Done',
    TO_DO: 'To Do'
};

//==============================================================================
// 2. MODAL HANDLING FUNCTIONS
//==============================================================================

/**
 * Opens the "New List" modal and positions it relative to the "Add another list" button.
 * @param {Event} event - The click event.
 */
function openNewListModal(event) {
    const modal = document.getElementById('newListModal');
    const modalContent = document.getElementById('newListModalContent');
    const addListButton = event.currentTarget;

    // Get the position of the "Add another list" button
    const rect = addListButton.getBoundingClientRect();

    // Position the modal at the same location as the button
    modalContent.style.top = `${rect.top + window.scrollY}px`;
    modalContent.style.left = `${rect.left + window.scrollX}px`;

    // Show the modal
    modal.classList.remove('hidden');
}

/**
 * Closes the "New List" modal.
 */
function closeNewListModal() {
    const modal = document.getElementById('newListModal');
    modal.classList.add('hidden');
}

/**
 * Opens the "New Card" modal and positions it relative to the "Add a card" button and the list.
 * @param {Event} event - The click event.
 * @param {number} listID - The ID of the list where the card is being added.
 */
function openNewCardModal(event, listID) {
    event.stopPropagation(); // Prevent the click event from propagating to the document

    const modal = document.getElementById('newCardModal');
    const modalContent = document.getElementById('newCardModalContent');
    const addCardButton = event.currentTarget; // The "Add a card" button
    const listContainer = document.getElementById(`list-item-${listID}`); // The parent list container

    // Store the list ID in a hidden input or variable
    modalContent.dataset.listId = listID;

    // Get the position of the "Add a card" button
    const buttonRect = addCardButton.getBoundingClientRect();

    // Get the position of the parent list container
    const listRect = listContainer.getBoundingClientRect();

    // Position the modal relative to the button and align it horizontally with the list
    modalContent.style.top = `${buttonRect.top + window.scrollY}px`; // Align vertically with the button
    modalContent.style.left = `${listRect.left + window.scrollX}px`; // Align horizontally with the list

    // Adjust the modal width to match the list width
    modalContent.style.width = `${listRect.width}px`;

    // Show the modal
    modal.classList.remove('hidden');
}

/**
 * Closes the "New Card" modal and clears the input field.
 */
function closeNewCardModal() {
    const modal = document.getElementById('newCardModal');
    const cardNameInput = document.getElementById('cardNameInput');
    modal.classList.add('hidden');
    cardNameInput.value = '';
}

//==============================================================================
// 3. LIST AND CARD FETCHING
//==============================================================================

/**
 * Fetches the lists for the current board and renders them.
 * @param {number} boardID - The ID of the board.
 */
async function fetchLists(boardID) {
    try {
        const response = await fetch('/User/GetLists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: boardID, // Send boardID as a raw value
        });

        const data = await response.json();

        if (data.success) {
            renderLists(data.lists);

            // Apply permissions AFTER lists are rendered
            applyRoleBasedPermissions();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching lists:', error);
    }
}

/**
 * Renders the lists and their cards on the board.
 * @param {Array} lists - The lists to render.
 */
function renderLists(lists) {
    const listsContainer = document.querySelector(SELECTORS.LISTS_CONTAINER);
    listsContainer.innerHTML = '';
    const isEditor = canEditBoard();

    // Render each list
    lists.forEach(list => {
        let cardsHTML = '';

        // Render cards for the current list
        list.cards.forEach(card => {
            // Determine if card is completed
            const isCompleted = card.status === STATUS.DONE;

            // Determine button class based on completion status
            const buttonClass = isCompleted
                ? 'text-green-500 opacity-100 relative'
                : 'text-gray-400 opacity-0 absolute left-0 group-hover:opacity-100';

            // Determine icon type based on completion status
            const iconType = isCompleted ? 'solid' : 'regular';

            // Determine text class based on completion status
            const textClass = isCompleted
                ? 'text-gray-400 ml-0'
                : 'text-gray-800 ml-0 group-hover:ml-6';

            // Render card with appropriate status indicators
            cardsHTML += `
                <div id="card-item-${card.cardID}" 
                    class="bg-white rounded shadow p-2 mb-2 w-full hover:border-blue-500 border-solid border-2 border-transparent group relative"
                    data-card-id="${card.cardID}" 
                    data-status="${card.status}"
                    onclick="openCardDetailModal(event, ${card.cardID})">
                    <div class="flex items-center relative">
                        ${isEditor ? `
                            <button onclick="toggleCardStatus(${card.cardID}); event.stopPropagation();" 
                                class="flex items-center status-toggle transition-all duration-400 mr-2 ${buttonClass}">
                                <i class="fa-${iconType} fa-circle-check text-lg"></i>
                            </button>
                        ` : `
                            <div class="flex items-center mr-2 ${isCompleted ? 'text-green-500 opacity-100 relative' : 'hidden'}">
                                <i class="fa-${iconType} fa-circle-check text-lg"></i>
                            </div>
                        `}
                        <span class="block text-sm font-medium transition-all duration-400 ${textClass}">${card.cardName}</span>
                    </div>
                </div>
            `;
        });

        // Render the list with its cards
        listsContainer.innerHTML += `
            <div id="list-item-${list.listID}"
                class="flex flex-col items-center justify-start bg-[#F1F3F4] gap-2 rounded shadow p-3 cursor-pointer h-fit w-full max-w-[300px] relative">
                <div class="top-list flex justify-between items-center w-full">
                    <input id="list-name-${list.listID}" class="p-2 font-bold text-gray-800 bg-transparent w-8/10 px-1" value="${list.listName}" />
                    <div class="relative">
                        <button id="list-settings-${list.listID}" onclick="toggleListDropdown(${list.listID})"
                            class="flex justify-center items-center px-1 py-1 rounded-sm hover:bg-black/20 size-8 cursor-pointer">
                            <i class="fa-solid fa-ellipsis text-[14px]"></i>
                        </button>
                        <div id="list-dropdown-${list.listID}" class="absolute right-0 mt-1 w-40 bg-white border-gray-300 border rounded shadow-md z-10 hidden">
                            <ul class="py-1">
                                <li>
                                    <button onclick="deleteList(${list.listID})" 
                                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200 cursor-pointer">
                                        Delete list
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- Cards Section -->
                <div class="cards-container w-full">
                    ${cardsHTML}
                </div>
                <!-- Add Card Button -->
                <button onclick="openNewCardModal(event, ${list.listID})" id="addCardButton-${list.listID}"
                    class="flex items-center justify-start gap-2 rounded p-4 cursor-pointer hover:bg-gray-300 h-12 w-full max-w-[300px] outline-none">
                    <i class="fa-solid fa-plus text-gray-600 text-base"></i>
                    <span class="block text-base font-semibold text-gray-600">Add a card</span>
                </button>
            </div>
        `;
    });

    // Add "Add another list" button for editors only
    if (isEditor) {
        listsContainer.innerHTML += `
            <button onclick="openNewListModal(event)" id="addListButton"
                class="flex items-center justify-start bg-gradient-to-r from-slate-300 gap-2 rounded shadow p-4 cursor-pointer hover:bg-gray-300 h-12 w-full max-w-[300px] outline-none">
                <i class="fa-solid fa-plus text-gray-600 text-base"></i>
                <span class="block text-base font-semibold text-gray-600">Add another list</span>
            </button>
        `;
    }

    // Setup list name editing after rendering
    lists.forEach(list => {
        setupListNameEditing(list.listID, list.listName);
    });
}

//==============================================================================
// 4. LIST MANAGEMENT
//==============================================================================

/**
 * Adds a new list to the board.
 */
async function addList() {
    const listNameInput = document.getElementById('listNameInput');
    const listName = listNameInput.value.trim();
    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    if (!listName) {
        alert('List name is required!');
        return;
    }

    try {
        const response = await fetch('/User/AddList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listName, boardId }),
        });

        const data = await response.json();

        if (data.success) {
            closeNewListModal();
            fetchLists(boardId); // Refresh the list
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding list:', error);
    }
}

/**
 * Sets up editing for a list name.
 * @param {number} listID - The ID of the list.
 * @param {string} originalName - The original name of the list.
 */
function setupListNameEditing(listID, originalName) {
    const listNameInput = document.getElementById(`list-name-${listID}`);

    // Function to handle the update
    const updateListName = async () => {
        const newName = listNameInput.value.trim();

        // If empty, reset to original name
        if (!newName) {
            listNameInput.value = originalName;
            return;
        }

        // Only update if name actually changed
        if (newName !== originalName) {
            try {
                const response = await fetch('/User/UpdateListName', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ listID, listName: newName }),
                });

                const data = await response.json();
                if (!data.success) {
                    console.error(data.message);
                    listNameInput.value = originalName; // Reset on error
                }
            } catch (error) {
                console.error('Error updating list name:', error);
                listNameInput.value = originalName; // Reset on error
            }
        }
    };

    // Update on blur (clicking outside)
    listNameInput.addEventListener('blur', updateListName);

    // Update on Enter key
    listNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            listNameInput.blur(); // This will trigger the blur event
        }
    });
}

/**
 * Toggles the visibility of a list's dropdown menu.
 * @param {number} listID - The ID of the list.
 */
function toggleListDropdown(listID) {
    const dropdown = document.getElementById(`list-dropdown-${listID}`);
    dropdown.classList.toggle('hidden');

    // Close all other dropdowns
    document.querySelectorAll('[id^="list-dropdown-"]').forEach(element => {
        if (element.id !== `list-dropdown-${listID}`) {
            element.classList.add('hidden');
        }
    });
}

/**
 * Deletes a list from the board.
 * @param {number} listID - The ID of the list to delete.
 */
async function deleteList(listID) {
    if (!confirm('Are you sure you want to delete this list and all its cards?')) {
        return;
    }

    try {
        const response = await fetch('/User/DeleteList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: listID,
        });

        const data = await response.json();
        if (data.success) {
            // Refresh the lists
            fetchLists(document.querySelector(SELECTORS.BOARD_ID).value);
        } else {
            console.error(data.message);
            alert('Failed to delete list: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting list:', error);
        alert('An error occurred while deleting the list');
    }
}

//==============================================================================
// 5. CARD MANAGEMENT
//==============================================================================

/**
 * Adds a new card to a list.
 */
async function addCard() {
    const cardNameInput = document.getElementById('cardNameInput');
    const cardName = cardNameInput.value.trim();
    const modalContent = document.getElementById('newCardModalContent');
    const listID = modalContent.dataset.listId;

    if (!cardName) {
        alert('Card name is required!');
        return;
    }

    try {
        const response = await fetch('/User/AddCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardName, listID }),
        });

        const data = await response.json();

        if (data.success) {
            // Clear the input field
            cardNameInput.value = '';

            // Close the modal
            closeNewCardModal();

            // Refresh the lists
            fetchLists(document.querySelector(SELECTORS.BOARD_ID).value);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding card:', error);
    }
}

/**
 * Toggles a card's status between "To Do" and "Done"
 * @param {number} cardID - The ID of the card
 */
async function toggleCardStatus(cardID) {
    const cardElement = document.getElementById(`card-item-${cardID}`);
    const currentStatus = cardElement.dataset.status;
    const newStatus = currentStatus === STATUS.DONE ? STATUS.TO_DO : STATUS.DONE;

    try {
        const response = await fetch('/User/UpdateCardStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardID: cardID,
                status: newStatus
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Update the UI directly without refreshing everything
            cardElement.dataset.status = newStatus;

            const statusToggle = cardElement.querySelector('.status-toggle');
            const cardText = cardElement.querySelector('span');

            // Clear existing classes first to avoid inconsistencies
            statusToggle.className = 'flex items-center status-toggle transition-all duration-200 mr-2';

            if (newStatus === STATUS.DONE) {
                // Done state - button visible and in normal flow
                statusToggle.classList.add('text-green-500', 'opacity-100', 'relative');
                statusToggle.querySelector('i').className = 'fa-solid fa-circle-check text-lg';

                // Update text color
                cardText.className = 'block text-sm font-medium transition-all duration-400 text-gray-400 ml-0';
            } else {
                // To Do state - button hidden and absolute positioned
                statusToggle.classList.add('text-gray-400', 'opacity-0', 'absolute', 'left-0', 'group-hover:opacity-100');
                statusToggle.querySelector('i').className = 'fa-regular fa-circle-check text-lg';

                // Update text color with hover margin
                cardText.className = 'block text-sm font-medium transition-all duration-400 text-gray-800 ml-0 group-hover:ml-6';
            }
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error updating card status:', error);
    }
}

/**
 * Sets up editing for the board name.
 */
function setupBoardNameEditing() {
    const boardNameInput = document.querySelector(SELECTORS.BOARD_NAME);
    const originalName = boardNameInput.value;

    // Function to handle the update
    const updateName = async () => {
        const newName = boardNameInput.value.trim();

        // If empty, reset to original name
        if (!newName) {
            boardNameInput.value = originalName;
            return;
        }

        // Only update if name actually changed
        if (newName !== originalName) {
            try {
                const boardId = document.querySelector(SELECTORS.BOARD_ID).value;
                const response = await fetch('/User/UpdateBoardName', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ boardId, boardName: newName }),
                });

                const data = await response.json();
                if (!data.success) {
                    console.error(data.message);
                    boardNameInput.value = originalName; // Reset on error
                }
            } catch (error) {
                console.error('Error updating board name:', error);
                boardNameInput.value = originalName; // Reset on error
            }
        }
    };

    // Update on blur (clicking outside)
    boardNameInput.addEventListener('blur', updateName);

    // Update on Enter key
    boardNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            boardNameInput.blur(); // This will trigger the blur event
        }
    });
}

/**
 * Deletes the current board after confirmation.
 */
async function deleteBoard() {
    if (!confirm('Are you sure you want to delete this board and all its lists and cards? This action cannot be undone.')) {
        return;
    }

    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    try {
        const response = await fetch('/User/DeleteBoard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardId }),
        });

        const data = await response.json();

        if (data.success) {
            // Redirect to home page after successful deletion
            window.location.href = '/User/Home';
        } else {
            console.error(data.message);
            alert('Failed to delete board: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting board:', error);
        alert('An error occurred while deleting the board');
    }
}

/**
 * Toggles the visibility of the settings dropdown menu.
 */
function toggleSettingsDropdown() {
    const dropdown = document.getElementById('settings-dropdown');
    dropdown.classList.toggle('hidden');
}

//==============================================================================
// 6. PERMISSION MANAGEMENT
//==============================================================================

/**
 * Checks if the current user can edit the board
 * @returns {boolean} - True if user can edit, false otherwise
 */
function canEditBoard() {
    const role = document.querySelector(SELECTORS.USER_ROLE).value;
    return role === 'Owner' || role === 'Editor';
}

/**
 * Disables editing features based on user role
 * [PERM-APPLY] - This is where all editor/viewer permissions are applied
 */
function applyRoleBasedPermissions() {
    const isEditor = canEditBoard();

    // Hide or disable elements for viewers
    if (!isEditor) {
        // [PERM-HIDE-ADDLIST] Hide "Add another list" button
        const addListButton = document.getElementById('addListButton');
        if (addListButton) addListButton.classList.add('hidden');

        // [PERM-HIDE-ADDCARD] Hide all "Add a card" buttons
        const addCardButtons = document.querySelectorAll(SELECTORS.CARD_BUTTONS);
        addCardButtons.forEach(button => button.classList.add('hidden'));

        // [PERM-HIDE-LISTS] Hide all list setting buttons
        const listSettingsButtons = document.querySelectorAll(SELECTORS.LIST_SETTINGS);
        listSettingsButtons.forEach(button => button.classList.add('hidden'));

        // [PERM-READONLY] Make all list name inputs readonly
        const listNameInputs = document.querySelectorAll(SELECTORS.LIST_NAMES);
        listNameInputs.forEach(input => {
            input.setAttribute('readonly', true);
            input.classList.add('cursor-default');
            input.classList.remove('hover:bg-gray-100');
        });

        // Make board name input readonly
        const boardNameInput = document.querySelector(SELECTORS.BOARD_NAME);
        if (boardNameInput) {
            boardNameInput.setAttribute('readonly', true);
            boardNameInput.classList.add('cursor-default');
        }

        // Disable settings button
        const settingsButton = document.getElementById('settings');
        if (settingsButton) settingsButton.classList.add('hidden');

        // Make share button view-only
        const shareButton = document.getElementById('shareBoard');
        if (shareButton) {
            shareButton.innerHTML = '<i class="fa-solid fa-users mr-1"></i> View Members';
        }

        // Add view-only indicator to card detail modal
        const cardDetailModal = document.getElementById('cardDetailModal');
        const cardDetailHeader = cardDetailModal.querySelector('.flex.items-center.justify-between.mb-4');
        if (cardDetailHeader) {
            // Create view-only badge if it doesn't exist
            if (!document.getElementById('view-only-badge')) {
                const viewOnlyBadge = document.createElement('div');
                viewOnlyBadge.id = 'view-only-badge';
                viewOnlyBadge.className = 'px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium';
                viewOnlyBadge.textContent = 'View Only';
                cardDetailHeader.appendChild(viewOnlyBadge);
            }
        }
    }
}

//==============================================================================
// 7. BOARD SHARING
//==============================================================================

/**
 * Opens the board sharing modal and loads board members.
 */
function openShareModal() {
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
function closeShareModal() {
    const modal = document.getElementById('shareBoardModal');
    modal.classList.add('hidden');
}

/**
 * Loads and displays board members.
 */
async function loadBoardMembers() {
    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    // Hide delete buttons for non-editors
    if (!canEditBoard()) {
        document.querySelectorAll('#boardMembers button').forEach(button => {
            button.style.display = 'none';
        });
    }

    try {
        const response = await fetch('/User/GetBoardMembers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: boardId,
        });

        const data = await response.json();

        if (data.success) {
            // Render owner
            const ownerEl = document.getElementById('boardOwner');
            ownerEl.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        ${data.owner.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="text-sm font-medium">${data.owner.fullname}</div>
                        <div class="text-xs text-gray-500">${data.owner.email}</div>
                    </div>
                </div>
                <div class="text-sm font-medium text-gray-700">Owner</div>
            `;

            // Render members
            const membersEl = document.getElementById('boardMembers');
            membersEl.innerHTML = '';

            if (data.members.length === 0) {
                membersEl.innerHTML = '<div class="py-3 text-sm text-gray-500">No members yet</div>';
            } else {
                data.members.forEach(member => {
                    membersEl.innerHTML += `
                        <div class="py-2 px-1 border-b flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    ${member.user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div class="text-sm font-medium">${member.user.fullName}</div>
                                    <div class="text-xs text-gray-500">${member.user.email}</div>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="text-sm font-medium text-gray-700 mr-2">${member.role}</div>
                                <button onclick="removeMember(${member.userID})" class="text-red-500 hover:text-red-700">
                                    <i class="fa-solid fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
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
async function inviteUser() {
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
        const response = await fetch('/User/InviteUserToBoard', {
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
async function removeMember(userId) {
    if (!confirm('Are you sure you want to remove this member from the board?')) {
        return;
    }

    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    try {
        const response = await fetch('/User/RemoveBoardMember', {
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

//==============================================================================
// 8. EVENT HANDLERS
//==============================================================================

/**
 * Closes the "New Card" modal when clicking outside of it.
 */
document.addEventListener('click', function (event) {
    const modal = document.getElementById('newCardModal');
    const modalContent = document.getElementById('newCardModalContent');
    const cardNameInput = document.getElementById('cardNameInput');

    // Check if the modal is currently visible
    if (!modal.classList.contains('hidden')) {
        if (!modalContent.contains(event.target) && !event.target.closest('.addCardButton')) {
            if (cardNameInput.value.trim() === '') {
                closeNewCardModal();
            } else {
                addCard();
            }
        }
    }
});

/**
 * Closes the "New List" modal when clicking outside of it.
 * If the list name input has content, it submits the new list.
 */
document.addEventListener('click', function (event) {
    const modal = document.getElementById('newListModal');
    const modalContent = document.getElementById('newListModalContent');
    const listNameInput = document.getElementById('listNameInput');

    // Check if the modal is currently visible
    if (!modal.classList.contains('hidden')) {
        if (!modalContent.contains(event.target) && !event.target.closest('#addListButton')) {
            if (listNameInput.value.trim() === '') {
                closeNewListModal();
            } else {
                addList();
            }
        }
    }
});

/**
 * Prevents the click event from propagating when interacting with the modal content.
 */
document.getElementById('newCardModalContent').addEventListener('click', function (event) {
    event.stopPropagation();
});

/**
 * Closes all list dropdowns when clicking outside of them.
 */
document.addEventListener('click', function (event) {
    if (!event.target.closest(SELECTORS.LIST_SETTINGS)) {
        document.querySelectorAll('[id^="list-dropdown-"]').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});

/**
 * Closes settings dropdown when clicking outside.
 */
document.addEventListener('click', function (event) {
    if (!event.target.closest('#settings')) {
        const dropdown = document.getElementById('settings-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    }
});

/**
 * Closes the share modal when clicking outside.
 */
document.addEventListener('click', function (event) {
    const modal = document.getElementById('shareBoardModal');
    const modalContent = modal.querySelector('div');

    if (!modal.classList.contains('hidden') && !modalContent.contains(event.target) && !event.target.closest('#shareBoard')) {
        closeShareModal();
    }
});

//==============================================================================
// 9. INITIALIZATION
//==============================================================================

/**
 * Main initialization function that runs when page loads.
 * Sets up the board and applies permissions.
 */
document.addEventListener('DOMContentLoaded', () => {
    const boardID = document.querySelector(SELECTORS.BOARD_ID).value;

    // Fetch and render lists
    fetchLists(boardID);

    // Set up board name editing
    setupBoardNameEditing();
});