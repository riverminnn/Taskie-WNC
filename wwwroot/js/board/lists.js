import { SELECTORS, STATUS } from './constants.js';
import { canEditBoard } from './permissions.js';

let listSubmissionInProgress = false;

/**
 * Fetches the lists for the current board and renders them.
 * @param {number} boardID - The ID of the board.
 */
export async function fetchLists(boardID) {
    try {
        const response = await fetch('/List/GetLists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(boardID), // Changed to use an object with boardID property
        });

        const data = await response.json();

        if (data.success) {
            renderLists(data.lists);
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
export function renderLists(lists) {
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

/**
 * Adds a new list to the board.
 */
export async function addList() {
    // Prevent duplicate submissions
    if (listSubmissionInProgress) return;

    listSubmissionInProgress = true;

    const listNameInput = document.getElementById('listNameInput');
    const listName = listNameInput.value.trim();
    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;

    if (!listName) {
        listSubmissionInProgress = false;
        alert('List name is required!');
        return;
    }

    try {
        const response = await fetch('/List/Add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listName, boardId }),
        });

        const data = await response.json();

        if (data.success) {
            listNameInput.value = '';
            import('./modals.js').then(module => {
                module.closeNewListModal();
                fetchLists(boardId);
            });
        } else {
            console.error(data.message);
        }
    } finally {
        // Reset the flag
        listSubmissionInProgress = false;
    }
}

/**
 * Sets up editing for a list name.
 * @param {number} listID - The ID of the list.
 * @param {string} originalName - The original name of the list.
 */
export function setupListNameEditing(listID, originalName) {
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
                const response = await fetch('/List/UpdateName', {
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
export function toggleListDropdown(listID) {
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
export async function deleteList(listID) {
    if (!confirm('Are you sure you want to delete this list and all its cards?')) {
        return;
    }

    try {
        const response = await fetch('/List/Delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listID),
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

// Make this function idempotent by cleaning up existing listeners
export function setupListInputHandlers() {
    const listNameInput = document.getElementById('listNameInput');

    if (listNameInput) {
        // Remove any existing listeners first
        listNameInput.removeEventListener('keypress', handleListEnterKey);

        // Add the listener
        listNameInput.addEventListener('keypress', handleListEnterKey);
    }
}

// Separated function for the event handler
function handleListEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addList();
    }
}

// Call this function when the list modal is opened
export function focusListInput() {
    const listNameInput = document.getElementById('listNameInput');
    if (listNameInput) {
        // Focus the input field and select any existing text
        listNameInput.focus();
        listNameInput.select();
    }
}