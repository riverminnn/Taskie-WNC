// ==========================
// Modal Handling Functions
// ==========================

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

    // Adjust the modal width to match the list width (optional)
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

// ==========================
// List and Card Fetching
// ==========================

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
    const listsContainer = document.querySelector('.lists-col'); // Adjust selector to match your container
    listsContainer.innerHTML = ''; // Clear existing lists

    // Render each list
    lists.forEach(list => {
        let cardsHTML = '';

        // Render cards for the current list
        list.cards.forEach(card => {
            // Determine if card is completed
            const isCompleted = card.status === "Done";
            console.log(isCompleted);

            cardsHTML += `
                <div id="card-item-${card.cardID}" 
                    class="bg-white rounded shadow p-2 mb-2 w-full hover:border-blue-500 border-solid border-2 border-transparent group relative"
                    data-card-id="${card.cardID}" 
                    data-status="${card.status}">
                    <div class="flex items-center relative">
                        <button onclick="toggleCardStatus(${card.cardID})" 
                            class="flex items-center status-toggle transition-all duration-400 mr-2 ${isCompleted
                    ? 'text-green-500 opacity-100 relative'
                    : 'text-gray-400 opacity-0 absolute left-0 group-hover:opacity-100'
                }">
                            <i class="fa-${isCompleted ? 'solid' : 'regular'} fa-circle-check text-lg"></i>
                        </button>
                        <span class="block text-sm font-medium transition-all duration-400 ${isCompleted
                    ? 'text-gray-400 ml-0'
                    : 'text-gray-800 ml-0 group-hover:ml-6'
                }">${card.cardName}</span>
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
                        <div id="list-dropdown-${list.listID}" class="absolute right-0 mt-1 w-40 bg-white rounded shadow-lg z-10 hidden">
                            <ul class="py-1">
                                <li>
                                    <button onclick="openNewCardModal(event, ${list.listID}); toggleListDropdown(${list.listID})" 
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Add card
                                    </button>
                                </li>
                                <li>
                                    <button onclick="deleteList(${list.listID})" 
                                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
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

    // Add "Add another list" button
    listsContainer.innerHTML += `
        <button onclick="openNewListModal(event)" id="addListButton"
            class="flex items-center justify-start bg-gradient-to-r from-slate-300 gap-2 rounded shadow p-4 cursor-pointer hover:bg-gray-300 h-12 w-full max-w-[300px] outline-none">
            <i class="fa-solid fa-plus text-gray-600 text-base"></i>
            <span class="block text-base font-semibold text-gray-600">Add another list</span>
        </button>
    `;

    // Setup list name editing after rendering
    lists.forEach(list => {
        setupListNameEditing(list.listID, list.listName);
    });
}

// ==========================
// Add List and Card Functions
// ==========================

/**
 * Adds a new list to the board.
 */
async function addList() {
    const listNameInput = document.getElementById('listNameInput');
    const listName = listNameInput.value.trim();
    const boardId = document.getElementById('boardId').value;

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
            fetchLists(document.getElementById('boardId').value);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding card:', error);
    }
}

// ==========================
// Event Listeners
// ==========================
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

// ==========================
// Initialization
// ==========================

/**
 * Fetches the lists when the page loads.
 */
document.addEventListener('DOMContentLoaded', () => {
    const boardID = document.getElementById('boardId').value;
    fetchLists(boardID);
});

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
            fetchLists(document.getElementById('boardId').value);
        } else {
            console.error(data.message);
            alert('Failed to delete list: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting list:', error);
        alert('An error occurred while deleting the list');
    }
}

/**
 * Closes all list dropdowns when clicking outside of them.
 */
document.addEventListener('click', function (event) {
    if (!event.target.closest('[id^="list-settings-"]')) {
        document.querySelectorAll('[id^="list-dropdown-"]').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});

function setupBoardNameEditing() {
    const boardNameInput = document.getElementById('boardName');
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
                const boardId = document.getElementById('boardId').value;
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

// Add this to your DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    const boardID = document.getElementById('boardId').value;
    fetchLists(boardID);
    setupBoardNameEditing(); // Add this line
});

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
 * Toggles a card's status between "To Do" and "Done"
 * @param {number} cardID - The ID of the card
 */
async function toggleCardStatus(cardID) {
    const cardElement = document.getElementById(`card-item-${cardID}`);
    const currentStatus = cardElement.dataset.status;
    const newStatus = currentStatus === "Done" ? "To Do" : "Done";

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

            if (newStatus === "Done") {
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