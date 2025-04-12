/**
 * Opens the "New List" modal and positions it relative to the "Add another list" button.
 * @param {Event} event - The click event.
 */
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
}

/**
 * Closes the "New List" modal.
 */
export function closeNewListModal() {
    const modal = document.getElementById('newListModal');
    modal.classList.add('hidden');
}

/**
 * Opens the "New Card" modal and positions it relative to the "Add a card" button and the list.
 * @param {Event} event - The click event.
 * @param {number} listID - The ID of the list where the card is being added.
 */
export function openNewCardModal(event, listID) {
    event.stopPropagation();

    const modal = document.getElementById('newCardModal');
    const modalContent = document.getElementById('newCardModalContent');
    const addCardButton = event.currentTarget;
    const listContainer = document.getElementById(`list-item-${listID}`);

    // Store the list ID in the modal
    modalContent.dataset.listId = listID;

    // Position and size the modal
    const buttonRect = addCardButton.getBoundingClientRect();
    const listRect = listContainer.getBoundingClientRect();

    modalContent.style.top = `${buttonRect.top + window.scrollY}px`;
    modalContent.style.left = `${listRect.left + window.scrollX}px`;
    modalContent.style.width = `${listRect.width}px`;

    // Show the modal
    modal.classList.remove('hidden');
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