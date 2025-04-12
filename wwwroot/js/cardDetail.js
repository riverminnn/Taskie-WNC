import { canEditBoard } from './board/permissions.js';
import { fetchLists } from './board/lists.js';

// Expose these functions to global scope for HTML onclick handlers
window.openCardDetailModal = openCardDetailModal;
window.closeCardDetailModal = closeCardDetailModal;
window.toggleCardDetailStatus = toggleCardDetailStatus;
window.saveDueDate = saveDueDate;
window.removeDueDate = removeDueDate;

/**
 * Opens the card detail modal.
 * @param {Event} event - The click event.
 * @param {number} cardID - The ID of the card.
 */

export async function openCardDetailModal(event, cardID) {
    event.stopPropagation();

    // Show the modal
    const modal = document.getElementById('cardDetailModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'items-center', 'justify-center');

    // Fetch card details
    try {
        const response = await fetch('/Card/GetDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardID }),
        });

        const data = await response.json();

        if (data.success) {
            populateCardDetailModal(data.card);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching card details:', error);
    }
}

/**
 * Populates the card detail modal with the card data.
 * @param {Object} card - The card data.
 */
export async function populateCardDetailModal(card) {
    const cardNameInput = document.getElementById('cardDetailName');
    const cardDescription = document.getElementById('cardDescription');
    const cardDueDate = document.getElementById('cardDueDate');
    const cardStatusToggle = document.getElementById('cardStatusToggle');
    const modalContent = document.getElementById('cardDetailModalContent');
    const isEditor = canEditBoard();

    // Store the card ID in the modal
    modalContent.dataset.cardId = card.cardID;

    // Store the original card name for restoration if needed
    modalContent.dataset.originalCardName = card.cardName;

    // Set card data
    cardNameInput.value = card.cardName;
    cardDescription.value = card.description || '';

    // Set readonly attributes based on role
    if (!isEditor) {
        cardNameInput.readOnly = true;
        cardDescription.readOnly = true;
        cardDueDate.readOnly = true;
        cardStatusToggle.style.pointerEvents = 'none';
    } else {
        cardNameInput.readOnly = false;
        cardDescription.readOnly = false;
        cardDueDate.readOnly = false;
        cardStatusToggle.style.pointerEvents = 'auto';

        // Add blur event listener for auto-update only if user can edit
        cardNameInput.removeEventListener('blur', handleCardNameBlur); // Remove to avoid duplicates
        cardNameInput.addEventListener('blur', handleCardNameBlur);
    }

    // Format and set due date if it exists - FIX THE DATE ISSUE HERE
    if (card.dueDate) {
        // Don't convert to Date object - work with string directly
        // First, ensure we have only the date part in YYYY-MM-DD format
        let dateStr = card.dueDate;

        // If the date includes time portion (contains 'T'), strip it off
        if (dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
        }

        // Set the value directly to avoid timezone issues
        cardDueDate.value = dateStr;
    } else {
        cardDueDate.value = '';
    }

    // Set card status
    updateCardStatusToggle(card.status);
}

/**
 * Updates the status toggle button based on the card's status.
 * @param {string} status - The card status ("Done" or "To Do").
 */
function updateCardStatusToggle(status) {
    const statusToggle = document.getElementById('cardStatusToggle');

    // Store the status in the dataset for reference
    statusToggle.dataset.status = status;

    // Update the icon based on status
    const isCompleted = status === "Done";
    statusToggle.innerHTML = `<i class="fa-${isCompleted ? 'solid' : 'regular'} fa-circle-check text-${isCompleted ? 'green' : 'gray'}-500"></i>`;
}

/**
 * Handles the blur event for the card name input.
 * Updates the card name or restores the original if empty.
 */
function handleCardNameBlur(event) {
    const cardNameInput = event.target;
    const modalContent = document.getElementById('cardDetailModalContent');
    const cardID = modalContent.dataset.cardId;
    const originalName = modalContent.dataset.originalCardName;

    let cardName = cardNameInput.value.trim();

    // If the card name is empty, restore the original name
    if (!cardName && originalName) {
        cardName = originalName;
        cardNameInput.value = originalName;
    }

    // Only update if the name has changed
    if (cardName !== originalName) {
        const description = document.getElementById('cardDescription').value.trim();
        const dueDate = document.getElementById('cardDueDate').value;
        const status = document.getElementById('cardStatusToggle').dataset.status;

        // Update the card
        updateCard(cardID, cardName, description, dueDate, status);

        // Update the original name for next comparison
        modalContent.dataset.originalCardName = cardName;
    }
}

/**
 * Closes the card detail modal.
 */
function closeCardDetailModal() {
    // First save any changes that might have been made
    saveCardChanges();

    // Then close the modal
    const modal = document.getElementById('cardDetailModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'items-center', 'justify-center');
}

/**
 * Saves all changes made to the card
 */
function saveCardChanges() {
    const modalContent = document.getElementById('cardDetailModalContent');
    const cardID = modalContent.dataset.cardId;

    // Only save if we have a valid card ID
    if (!cardID) return;

    // Only proceed if the user has edit permissions
    if (!canEditBoard()) return;

    const cardName = document.getElementById('cardDetailName').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    const dueDate = document.getElementById('cardDueDate').value;
    const status = document.getElementById('cardStatusToggle').dataset.status;

    // Don't save if card name is empty
    if (!cardName) return;

    // Save all card details
    updateCard(cardID, cardName, description, dueDate, status);
}

/**
 * Toggles the card status in the detail modal.
 */
function toggleCardDetailStatus() {
    const statusToggle = document.getElementById('cardStatusToggle');
    const currentStatus = statusToggle.dataset.status;
    const newStatus = currentStatus === "Done" ? "To Do" : "Done";

    statusToggle.dataset.status = newStatus;

    // Update the icon
    const isCompleted = newStatus === "Done";
    statusToggle.innerHTML = `<i class="fa-${isCompleted ? 'solid' : 'regular'} fa-circle-check text-${isCompleted ? 'green' : 'gray'}-500"></i>`;
}

/**
 * Saves the due date and hides the date picker.
 */
function saveDueDate() {
    const cardID = document.getElementById('cardDetailModalContent').dataset.cardId;
    const dueDate = document.getElementById('cardDueDate').value;
    const cardName = document.getElementById('cardDetailName').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    const status = document.getElementById('cardStatusToggle').dataset.status;

    // Use the date string directly without creating a Date object
    updateCard(cardID, cardName, description, dueDate, status);

    // Hide the date picker
    document.getElementById('datePickerContainer').classList.add('hidden');
}

/**
 * Updates the card with the provided details.
 */
async function updateCard(cardID, cardName, description, dueDate, status) {
    try {
        const response = await fetch('/Card/Update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardID,
                cardName,
                description,
                dueDate,
                status
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Refresh lists to show updated card
            const boardId = document.getElementById('boardId').value;
            fetchLists(boardId);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error updating card:', error);
    }
}

function removeDueDate() {
    // Clear the date input
    document.getElementById('cardDueDate').value = '';

    // Save the card with the cleared date
    saveDueDate();
}

/**
 * Toggles the visibility of the date picker.
 */
function toggleDatePicker() {
    const datePickerContainer = document.getElementById('datePickerContainer');

    // Close any other open dropdowns first
    const allDropdowns = document.querySelectorAll('.dropdown-container');
    allDropdowns.forEach(dropdown => {
        if (dropdown !== datePickerContainer && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });

    // Toggle this dropdown
    if (datePickerContainer.classList.contains('hidden')) {
        datePickerContainer.classList.remove('hidden');
        document.getElementById('cardDueDate').focus();
    } else {
        datePickerContainer.classList.add('hidden');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Close modal when clicking the close button
    document.getElementById('closeCardDetailModal').addEventListener('click', closeCardDetailModal);

    // Close modal when clicking outside the modal content
    document.getElementById('cardDetailModal').addEventListener('click', function (event) {
        if (event.target === this) {
            closeCardDetailModal();
        }
    });

    // Toggle status when clicking the status toggle button
    document.getElementById('cardStatusToggle').addEventListener('click', toggleCardDetailStatus);

    // Set up event listener for the dates button
    const datesButton = document.getElementById('datesButton');
    if (datesButton) {
        datesButton.addEventListener('click', toggleDatePicker);
    } else {
        console.error("Dates button not found!");
    }

    // Close date picker when clicking outside
    document.addEventListener('click', function (event) {
        const datePickerContainer = document.getElementById('datePickerContainer');
        const datesButton = document.getElementById('datesButton');

        if (!datePickerContainer.classList.contains('hidden') &&
            !datePickerContainer.contains(event.target) &&
            event.target !== datesButton &&
            !datesButton.contains(event.target)) {
            datePickerContainer.classList.add('hidden');
        }
    });

    const cardNameInput = document.getElementById('cardDetailName');
    if (cardNameInput) {
        cardNameInput.removeEventListener('blur', handleCardNameBlur); // Remove to avoid duplicates
        cardNameInput.addEventListener('blur', handleCardNameBlur);
    }
});