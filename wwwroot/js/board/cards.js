import { SELECTORS, STATUS } from './constants.js';
import { closeNewCardModal } from './modals.js';
import { fetchLists } from './lists.js';

/**
 * Adds a new card to a list.
 */
export async function addCard() {
    const cardNameInput = document.getElementById('cardNameInput');
    const cardName = cardNameInput.value.trim();
    const modalContent = document.getElementById('newCardModalContent');
    const listID = modalContent.dataset.listId;

    if (!cardName) {
        alert('Card name is required!');
        return;
    }

    try {
        const response = await fetch('/Card/Add', {
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