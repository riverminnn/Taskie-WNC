import { SELECTORS, STATUS } from './constants.js';
import { canEditBoard } from './permissions.js';
import { setupCardDragAndDrop } from './cards.js';


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

    // Sort lists by position
    lists.sort((a, b) => a.position - b.position);

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
    class="bg-white rounded shadow p-1.5 md:p-2 mb-1.5 md:mb-2 w-full hover:border-blue-500 border-solid border-2 border-transparent group relative"
    data-card-id="${card.cardID}" 
    data-status="${card.status}"
    data-position="${card.position || 0}"
    onclick="openCardDetailModal(event, ${card.cardID})">
<div class="flex items-center relative">
    ${isEditor ? `
        <button onclick="toggleCardStatus(${card.cardID}); event.stopPropagation();" 
            class="flex items-center status-toggle transition-all duration-400 mr-1 md:mr-2 ${buttonClass}">
            <i class="fa-${iconType} fa-circle-check text-base md:text-lg"></i>
        </button>
    ` : `
        <div class="flex items-center mr-1 md:mr-2 ${isCompleted ? 'text-green-500 opacity-100 relative' : 'hidden'}">
            <i class="fa-${iconType} fa-circle-check text-base md:text-lg"></i>
        </div>
    `}
    <span class="w-full block text-xs md:text-sm font-medium transition-all duration-400 truncate overflow-hidden ${textClass}" title="${card.cardName}">${card.cardName}</span>
</div>
</div>
`;
        });

        // Render the list with its cards - using mobile-first approach for full-width on mobile
        listsContainer.innerHTML += `
            <div id="list-item-${list.listID}" 
                class="list-none transition-opacity duration-500 flex flex-col items-center justify-start bg-[#F1F3F4] gap-1 md:gap-2 rounded shadow p-2 md:p-3 cursor-pointer h-fit w-[90vw] min-w-[85vw] md:w-auto md:min-w-0 md:max-w-[300px] shrink-0 relative" 
                data-list-id="${list.listID}"
                data-list-position="${list.position || 0}"
                draggable="true">
                <div class="top-list flex justify-between items-center w-full">
                    <input id="list-name-${list.listID}" class="p-1 md:p-2 font-bold text-gray-800 bg-transparent w-8/10 px-1 text-sm md:text-base" value="${list.listName}" />
                    <div class="relative">
                        <button id="list-settings-${list.listID}" onclick="toggleListDropdown(${list.listID})"
                            class="flex justify-center items-center px-1 py-1 rounded-sm hover:bg-black/20 size-6 md:size-8 cursor-pointer">
                            <i class="fa-solid fa-ellipsis text-[12px] md:text-[14px]"></i>
                        </button>
                        <div id="list-dropdown-${list.listID}" class="absolute right-0 mt-1 w-36 md:w-40 bg-white border-gray-300 border rounded shadow-md z-10 hidden">
                            <ul class="py-1">
                                <li>
                                    <button onclick="deleteList(${list.listID})" 
                                        class="block w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-red-600 hover:bg-gray-200 cursor-pointer">
                                        <i class="fa-solid fa-trash-can mr-2"></i> Delete list
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
                    class="new-card flex items-center justify-start gap-2 rounded p-2 md:p-4 cursor-pointer hover:bg-gray-300 h-10 md:h-12 w-full outline-none">
                    <i class="fa-solid fa-plus text-gray-600 text-sm md:text-base"></i>
                    <span class="block text-sm md:text-base font-semibold text-gray-600">Add a card</span>
                </button>
            </div>
            `;
    });

    // Add "Add another list" button for editors only
    if (isEditor) {
        listsContainer.innerHTML += `
        <button onclick="openNewListModal(event)" id="addListButton"
            class="flex items-center justify-start bg-blue-400 hover:bg-blue-500 gap-1 md:gap-2 rounded-lg shadow p-2 md:p-4 cursor-pointer h-10 md:h-12 w-[90vw] min-w-[85vw] md:w-auto md:min-w-0 md:max-w-[300px] shrink-0 outline-none">
            <i class="fa-solid fa-plus text-white text-sm md:text-base"></i>
            <span class="block text-sm md:text-base font-semibold text-white">Add another list</span>
        </button>
    `;
    }

    // Setup list name editing after rendering
    lists.forEach(list => {
        setupListNameEditing(list.listID, list.listName);
    });

    // Setup drag & drop if user is an editor
    if (isEditor) {
        setupDragAndDrop();
        setupCardDragAndDrop();
    }
}

/**
 * Sets up drag and drop functionality for lists
 */
function setupDragAndDrop() {
    const listItems = document.querySelectorAll('.list-none');
    const listsContainer = document.querySelector(SELECTORS.LISTS_CONTAINER);
    const addListButton = document.getElementById('addListButton');

    // Store list being dragged
    let draggedList = null;

    // Add drag events to each list
    listItems.forEach(list => {
        // For drag start
        list.addEventListener('dragstart', (e) => {
            // Don't start dragging the list if we're currently dragging a card
            if (document.querySelector('.card-item.opacity-50')) {
                e.preventDefault();
                return;
            }

            draggedList = list;
            setTimeout(() => list.classList.add('opacity-50'), 0);
            e.dataTransfer.effectAllowed = 'move';
        });

        // Dragging over another list
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        // For entering another list's area
        list.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (list !== draggedList) {
                list.classList.add('shadows-md');
            }
        });

        // For leaving another list's area
        list.addEventListener('dragleave', () => {
            list.classList.remove('shadows-md');
        });

        // End dragging
        list.addEventListener('dragend', (e) => {
            list.classList.remove('opacity-50');
            listItems.forEach(item => {
                item.classList.remove('shadows-md');
            });
            draggedList = null;
        });

        // Drop on another list
        list.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (list !== draggedList) {
                // Get all lists and their positions
                const lists = Array.from(document.querySelectorAll('.list-none'));
                const sourceIndex = lists.indexOf(draggedList);
                const targetIndex = lists.indexOf(list);

                // Reorder DOM elements
                if (sourceIndex < targetIndex) {
                    listsContainer.insertBefore(draggedList, list.nextSibling);
                } else {
                    listsContainer.insertBefore(draggedList, list);
                }

                // Update positions in the database
                await updateListPositions();
            }
        });
    });

    // Modified container drop handling
    listsContainer.addEventListener('dragover', (e) => {
        // Only allow dropping if we're not over the add list button
        if (!e.target.closest('#addListButton')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    });

    listsContainer.addEventListener('drop', async (e) => {
        // Don't allow dropping directly on the container or near the add button
        if (e.target === listsContainer && !isNearAddButton(e)) {
            e.preventDefault();

            // Get all lists to find the last list
            const lists = Array.from(document.querySelectorAll('.list-none'));
            const lastList = lists[lists.length - 1];

            if (lastList && lastList !== draggedList) {
                // Instead of appending, insert before the add button
                if (addListButton) {
                    listsContainer.insertBefore(draggedList, addListButton);
                } else {
                    listsContainer.appendChild(draggedList);
                }

                await updateListPositions();
            }
        }
    });
    // Helper function to determine if we're near the add button
    function isNearAddButton(event) {
        if (!addListButton) return false;

        const buttonRect = addListButton.getBoundingClientRect();
        const bufferZone = 100; // 100px zone around the button

        return (
            event.clientX >= buttonRect.left - bufferZone &&
            event.clientX <= buttonRect.right + bufferZone &&
            event.clientY >= buttonRect.top - bufferZone &&
            event.clientY <= buttonRect.bottom + bufferZone
        );
    }
}

/**
 * Updates list positions in the database after drag and drop
 */
async function updateListPositions() {
    // Get all lists in their current order
    const lists = Array.from(document.querySelectorAll('.list-none'));

    // Create an array of {listID, position} objects
    const updatedPositions = lists.map((list, index) => ({
        listID: parseInt(list.dataset.listId),
        position: index
    }));

    try {
        const response = await fetch('/List/UpdatePositions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPositions),
        });

        const result = await response.json();
        if (!result.success) {
            console.error('Failed to update list positions:', result.message);
        }
    } catch (error) {
        console.error('Error updating list positions:', error);
    }
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

    // Get current lists to determine the next position
    const existingLists = Array.from(document.querySelectorAll('.list-none'));
    let nextPosition = 0;

    // If there are existing lists, get the highest position + 1
    if (existingLists.length > 0) {
        const positions = existingLists.map(list =>
            parseInt(list.dataset.listPosition) || 0
        );
        nextPosition = Math.max(...positions) + 1;
    }

    try {
        const response = await fetch('/List/Add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listName,
                boardId,
                position: nextPosition // Add the position value
            }),
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