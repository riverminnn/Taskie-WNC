import { SELECTORS, STATUS } from './constants.js';
import { closeNewCardModal, openNewCardModal } from './modals.js';
import { fetchLists } from './lists.js';

let cardSubmissionInProgress = false;

/**
 * Adds a new card to a list.
 */
export async function addCard() {
    if (cardSubmissionInProgress) return;

    cardSubmissionInProgress = true;

    const cardNameInput = document.getElementById('cardNameInput');
    const cardName = cardNameInput.value.trim();
    const modalContent = document.getElementById('newCardModalContent');
    const listID = modalContent.dataset.listId;

    if (!cardName) {
        cardSubmissionInProgress = false;
        alert('Card name is required!');
        return;
    }

    // Calculate the next position for the card
    const listElement = document.querySelector(`[data-list-id="${listID}"]`);
    let nextPosition = 0;

    if (listElement) {
        const cardsContainer = listElement.querySelector('.cards-container');
        const existingCards = Array.from(cardsContainer.querySelectorAll('[id^="card-item-"]'));

        // If there are existing cards, get the highest position + 1
        if (existingCards.length > 0) {
            const positions = existingCards.map(card => {
                // Get position from dataset or from backend data
                return parseInt(card.dataset.position || 0);
            });
            nextPosition = Math.max(...positions) + 1;
        }
    }

    try {
        const response = await fetch('/Card/Add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardName,
                listID,
                position: nextPosition  // Add the position parameter
            }),
        });

        // Rest of your function remains the same...

        const data = await response.json();

        if (data.success) {
            // Clear the input field
            cardNameInput.value = '';

            closeNewCardModal();

            // Refresh the lists
            await fetchLists(document.querySelector(SELECTORS.BOARD_ID).value);

            setTimeout(() => {
                const addCardButton = document.getElementById(`addCardButton-${listID}`);
                if (addCardButton) {
                    // Create a simulated click event
                    const simulatedEvent = {
                        currentTarget: addCardButton,
                        stopPropagation: function () { } // Dummy function
                    };

                    // Call openNewCardModal with the correct parameters
                    openNewCardModal(simulatedEvent, listID);
                }
            }, 0);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding card:', error);
    } finally {
        // Reset the flag
        cardSubmissionInProgress = false;
    }
}

/**
 * Toggles a card's status between "To Do" and "Done"
 * @param {number} cardID - The ID of the card
 */
export async function toggleCardStatus(cardID) {
    const cardElement = document.getElementById(`card-item-${cardID}`);
    const currentStatus = cardElement.dataset.status;
    const newStatus = currentStatus === STATUS.DONE ? STATUS.TO_DO : STATUS.DONE;

    try {
        const response = await fetch('/Card/UpdateStatus', {
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

// Make this function idempotent by cleaning up existing listeners
export function setupCardInputHandlers() {
    const cardNameInput = document.getElementById('cardNameInput');

    if (cardNameInput) {
        // Remove any existing listeners first
        cardNameInput.removeEventListener('keypress', handleCardEnterKey);

        // Add the listener
        cardNameInput.addEventListener('keypress', handleCardEnterKey);
    }
}

// Separated function for the event handler
function handleCardEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addCard();
    } else if (event.key === 'Escape') {
        closeNewCardModal();
    }
}

// Call this function when the card modal is opened
export function focusCardInput() {
    const cardNameInput = document.getElementById('cardNameInput');
    if (cardNameInput) {
        // Focus the input field and select any existing text
        cardNameInput.focus();
        cardNameInput.select();
    }
}

/**
 * Sets up drag and drop functionality for cards
 */
export function setupCardDragAndDrop() {
    const cards = document.querySelectorAll('[id^="card-item-"]');
    const cardContainers = document.querySelectorAll('.cards-container');
    let draggedCard = null;

    // Add drag events to each card
    cards.forEach(card => {
        // Make cards draggable
        card.setAttribute('draggable', 'true');

        // Start dragging
        card.addEventListener('dragstart', (e) => {
            e.stopPropagation(); // Prevent the event from bubbling up to the list
            draggedCard = card;
            setTimeout(() => card.classList.add('opacity-50'), 0);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.cardId);
        });

        // End dragging
        card.addEventListener('dragend', () => {
            card.classList.remove('opacity-50');
            cards.forEach(c => c.classList.remove('card-drag-over'));

            // Also remove any visual indicators from containers
            cardContainers.forEach(container =>
                container.classList.remove('list-drag-target', 'list-drag-target-top', 'list-drag-target-bottom'));

            draggedCard = null;
        });

        // Other card event handlers remain the same...
    });

    // Setup list containers as drop zones for cards
    cardContainers.forEach(container => {
        // Allow dropping
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            // If container is empty, just show general highlight
            const containerCards = container.querySelectorAll('[id^="card-item-"]');
            if (containerCards.length === 0) {
                container.classList.add('list-drag-target');
                return;
            }

            // Get mouse position to determine drop position
            const rect = container.getBoundingClientRect();
            const mouseY = e.clientY;

            // Remove all special classes first
            container.classList.remove('list-drag-target', 'list-drag-target-top', 'list-drag-target-bottom');

            // Set appropriate visual indicator class
            if (containerCards.length === 0) {
                container.classList.add('list-drag-target');
            } else {
                container.classList.add('list-drag-target-bottom');
            }
        });

        // Visual indication when card is dragged over container
        container.addEventListener('dragenter', (e) => {
            // Check if we're entering from outside the container
            if (!container.contains(draggedCard)) {
                const containerCards = container.querySelectorAll('[id^="card-item-"]');

                // Choose appropriate class based on whether container has cards
                if (containerCards.length === 0) {
                    container.classList.add('list-drag-target');
                } else {
                    container.classList.add('list-drag-target-bottom');
                }
            }
        });

        container.addEventListener('dragleave', (e) => {
            // Only remove the class if we're truly leaving the container
            if (!container.contains(e.relatedTarget)) {
                container.classList.remove('list-drag-target', 'list-drag-target-top', 'list-drag-target-bottom');
            }
        });

        // Handle drops on the container
        container.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Remove all visual indicators
            container.classList.remove('list-drag-target', 'list-drag-target-top', 'list-drag-target-bottom');

            // Get list info
            const listItem = container.closest('[id^="list-item-"]');
            const targetListID = listItem.dataset.listId;
            const sourceListID = draggedCard.closest('[id^="list-item-"]').dataset.listId;

            // If dropping directly on the container (not on a card)
            if (e.target === container || e.target.closest('.cards-container') === container) {
                // Get all cards in the container to determine position
                const containerCards = Array.from(container.querySelectorAll('[id^="card-item-"]'));

                // If container is empty or dropping at the end
                if (containerCards.length === 0 ||
                    !e.target.closest('[id^="card-item-"]')) {
                    // Append card to the end
                    container.appendChild(draggedCard);

                    if (sourceListID === targetListID) {
                        // Just a reorder within the same list
                        await updateCardPositions(targetListID);
                    } else {
                        // Move to another list
                        await moveCardToList(draggedCard.dataset.cardId, targetListID);
                    }
                    return;
                }

                // If we're dropping on a specific card
                const targetCard = e.target.closest('[id^="card-item-"]');
                if (targetCard && targetCard !== draggedCard) {
                    const rect = targetCard.getBoundingClientRect();
                    const dropPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

                    if (dropPosition === 'before') {
                        container.insertBefore(draggedCard, targetCard);
                    } else {
                        container.insertBefore(draggedCard, targetCard.nextSibling);
                    }

                    if (sourceListID === targetListID) {
                        // Just a reorder within the same list
                        await updateCardPositions(targetListID);
                    } else {
                        // Move to another list
                        await moveCardToList(draggedCard.dataset.cardId, targetListID);
                    }
                }
            }
        });
    });
}

/**
 * Updates card positions in the database after drag and drop within a list
 * @param {string} listID - The list ID containing the cards
 */
async function updateCardPositions(listID) {
    // Get all cards in the list
    const listElement = document.querySelector(`[data-list-id="${listID}"]`);
    const cardContainer = listElement.querySelector('.cards-container');
    const cards = Array.from(cardContainer.querySelectorAll('[id^="card-item-"]'));

    // Create position updates array
    const positions = cards.map((card, index) => ({
        cardID: parseInt(card.dataset.cardId),
        position: index
    }));

    try {
        const response = await fetch('/Card/UpdatePositions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(positions)
        });

        const result = await response.json();
        if (!result.success) {
            console.error('Failed to update card positions:', result.message);
        }
    } catch (error) {
        console.error('Error updating card positions:', error);
    }
}

/**
 * Moves a card to a different list
 * @param {string} cardID - The card ID to move
 * @param {string} targetListID - The destination list ID
 */
async function moveCardToList(cardID, targetListID) {
    try {
        const response = await fetch('/Card/MoveToList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardID: parseInt(cardID),
                listID: parseInt(targetListID)
            })
        });

        const result = await response.json();
        if (result.success) {
            // Update positions in the new list
            await updateCardPositions(targetListID);
        } else {
            console.error('Failed to move card:', result.message);
            // If failed, refresh the board to restore original state
            const boardID = document.querySelector(SELECTORS.BOARD_ID).value;
            fetchLists(boardID);
        }
    } catch (error) {
        console.error('Error moving card:', error);
        // Refresh the board to restore original state
        const boardID = document.querySelector(SELECTORS.BOARD_ID).value;
        fetchLists(boardID);
    }
}