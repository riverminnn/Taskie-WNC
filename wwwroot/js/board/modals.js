// Import at the top of the file
import { setupListInputHandlers, focusListInput } from './lists.js';
import { setupCardInputHandlers, focusCardInput } from './cards.js';

export function openNewCardModal(event, listID) {
    event.stopPropagation();

    const modal = document.getElementById('newCardModal');
    const modalContent = document.getElementById('newCardModalContent');
    const listContainer = document.getElementById(`list-item-${listID}`);

    if (!listContainer) return;

    // Store the list ID in the modal
    modalContent.dataset.listId = listID;

    // Set position to fixed so it stays in place during scrolling
    modalContent.style.position = 'fixed';

    const listRect = listContainer.getBoundingClientRect();
    const addButton = listContainer.querySelector(`#addCardButton-${listID}`);
    const buttonRect = addButton.getBoundingClientRect();

    // Position at the bottom of the list relative to viewport
    // No need for window.scrollY/X with fixed positioning
    modalContent.style.top = `${buttonRect.top}px`;
    modalContent.style.left = `${listRect.left}px`;
    modalContent.style.width = `${listRect.width}px`;

    // Show the modal
    modal.classList.remove('hidden');

    // Add Enter key handler and focus the input
    setupCardInputHandlers();
    focusCardInput();
}

// Modify the openNewListModal function
export function openNewListModal(event) {
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

    // Add Enter key handler and focus the input
    setupListInputHandlers();
    focusListInput();
}

/**
 * Closes the "New List" modal.
 */
export function closeNewListModal() {
    const modal = document.getElementById('newListModal');
    modal.classList.add('hidden');
}

/**
 * Closes the "New Card" modal and clears the input field.
 */
export function closeNewCardModal() {
    const modal = document.getElementById('newCardModal');
    const cardNameInput = document.getElementById('cardNameInput');
    modal.classList.add('hidden');
    cardNameInput.value = '';
}