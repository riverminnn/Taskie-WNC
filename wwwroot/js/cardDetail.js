/**
 * Opens the card detail modal.
 * @param {Event} event - The click event.
 * @param {number} cardID - The ID of the card.
 */
async function openCardDetailModal(event, cardID) {
    event.stopPropagation();

    // Show the modal
    const modal = document.getElementById('cardDetailModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'items-center', 'justify-center');

    // Fetch card details
    try {
        const response = await fetch('/User/GetCardDetails', {
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
function populateCardDetailModal(card) {
    const cardNameInput = document.getElementById('cardDetailName');
    const cardDescription = document.getElementById('cardDescription');
    const cardDueDate = document.getElementById('cardDueDate');
    const cardStatusToggle = document.getElementById('cardStatusToggle');
    const saveButton = document.getElementById('saveCardChanges');
    const isEditor = canEditBoard();

    // Set card data
    cardNameInput.value = card.cardName;
    cardDescription.value = card.description || '';

    // Set readonly attributes based on role
    if (!isEditor) {
        cardNameInput.readOnly = true;
        cardDescription.readOnly = true;
        cardDueDate.readOnly = true;
        cardStatusToggle.style.pointerEvents = 'none';
        saveButton.style.display = 'none';
    } else {
        cardNameInput.readOnly = false;
        cardDescription.readOnly = false;
        cardDueDate.readOnly = false;
        cardStatusToggle.style.pointerEvents = 'auto';
        saveButton.style.display = 'block';
    }

    // Format and set due date if it exists
    if (card.dueDate) {
        const date = new Date(card.dueDate);
        cardDueDate.value = date.toISOString().split('T')[0];
    } else {
        cardDueDate.value = '';
    }

    // Set status toggle icon
    const isCompleted = card.status === "Done";
    cardStatusToggle.innerHTML = `<i class="fa-${isCompleted ? 'solid' : 'regular'} fa-circle-check text-${isCompleted ? 'green' : 'gray'}-500"></i>`;
    cardStatusToggle.dataset.cardId = card.cardID;
    cardStatusToggle.dataset.status = card.status;

    // Store card ID in modal for saving
    document.getElementById('cardDetailModalContent').dataset.cardId = card.cardID;
}

/**
 * Closes the card detail modal.
 */
function closeCardDetailModal() {
    const modal = document.getElementById('cardDetailModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex', 'items-center', 'justify-center');
}

/**
 * Saves the card changes.
 */
async function saveCardChanges() {
    const modalContent = document.getElementById('cardDetailModalContent');
    const cardID = modalContent.dataset.cardId;

    const cardName = document.getElementById('cardDetailName').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    const dueDate = document.getElementById('cardDueDate').value;
    const status = document.getElementById('cardStatusToggle').dataset.status;

    if (!cardName) {
        alert('Card name is required!');
        return;
    }

    try {
        const response = await fetch('/User/UpdateCard', {
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
            closeCardDetailModal();
            // Refresh lists to show updated card
            fetchLists(document.getElementById('boardId').value);
        } else {
            console.error(data.message);
            alert('Error saving card: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving card:', error);
        alert('An error occurred while saving the card');
    }
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

    // Save changes when clicking the save button
    document.getElementById('saveCardChanges').addEventListener('click', saveCardChanges);
});