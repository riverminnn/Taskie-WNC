import { canEditBoard } from './board/permissions.js';
import { fetchLists } from './board/lists.js';

// Expose these functions to global scope for HTML onclick handlers
window.openCardDetailModal = openCardDetailModal;
window.closeCardDetailModal = closeCardDetailModal;
window.toggleCardDetailStatus = toggleCardDetailStatus;
window.saveDueDate = saveDueDate;
window.removeDueDate = removeDueDate;
window.addComment = addComment;
window.deleteComment = deleteComment;

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
            // Load comments for this card
            loadComments(cardID);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching card details:', error);
    }
}

/**
 * Loads comments for a card
 * @param {number} cardID - The ID of the card
 */
async function loadComments(cardID) {
    try {
        const response = await fetch('/Card/GetComments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardID }),
        });

        const data = await response.json();

        console.log(data);


        if (data.success) {
            renderComments(data.comments);
        } else {
            console.error(data.message);
            document.getElementById('commentsContainer').innerHTML =
                `<div class="text-sm text-red-500">Error loading comments: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('commentsContainer').innerHTML =
            '<div class="text-sm text-red-500">Error loading comments. Please try again.</div>';
    }
}

/**
 * Renders comments in the comment container
 * @param {Array} comments - Array of comment objects
 */
function renderComments(comments) {
    const container = document.getElementById('commentsContainer');

    // Clear container
    container.innerHTML = '';

    if (comments.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray-500 italic">No comments yet</div>';
        return;
    }

    // Sort comments by date (newest first)
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Check if user can edit
    const isEditor = canEditBoard();

    // Generate HTML for each comment
    comments.forEach(comment => {
        const formattedDate = new Date(comment.createdAt).toLocaleString();

        // Create comment element
        const commentEl = document.createElement('div');
        commentEl.className = 'border-b border-gray-200 pb-3 mb-3'; // Added mb-3 for spacing
        commentEl.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0 mr-3">
                    <div class="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                        ${comment.userInitial}
                    </div>
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <span class="font-medium">${comment.userName}</span>
                        <div class="flex items-center">
                            <span class="text-xs text-gray-500 mr-2">${formattedDate}</span>
                            ${(isEditor || comment.isCurrentUser) ?
                `<button class="delete-comment-btn text-gray-400 hover:text-red-500" data-comment-id="${comment.commentID}">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>` :
                ''}
                        </div>
                    </div>
                    <p class="text-sm mt-1 whitespace-pre-wrap">${comment.content}</p>
                </div>
            </div>
        `;

        container.appendChild(commentEl);

        // Add event listener to delete button if it exists
        const deleteBtn = commentEl.querySelector('.delete-comment-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                deleteComment(comment.commentID);
            });
        }
    });
}
/**
 * Adds a new comment to the card
 */
async function addComment() {
    // Check if user has edit permissions
    if (!canEditBoard()) {
        alert('You do not have permission to comment on this card.');
        return;
    }

    const commentText = document.getElementById('cardComment').value.trim();
    if (!commentText) return;

    const cardID = document.getElementById('cardDetailModalContent').dataset.cardId;

    try {
        const response = await fetch('/Card/AddComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardID,
                content: commentText
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Clear the input field
            document.getElementById('cardComment').value = '';

            // Refresh the comments
            loadComments(cardID);
        } else {
            console.error(data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('An error occurred while adding your comment.');
    }
}

/**
 * Deletes a comment from the card
 * @param {number} commentID - The ID of the comment to delete
 */
async function deleteComment(commentID) {
    try {
        const cardID = document.getElementById('cardDetailModalContent').dataset.cardId;

        const response = await fetch('/Card/DeleteComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ commentID }),
        });

        const data = await response.json();

        if (data.success) {
            // Refresh comments to reflect the deletion
            loadComments(cardID);
        } else {
            console.error(data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('An error occurred while deleting the comment.');
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
    if (!canEditBoard()) {
        return;
    }
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

    // Set up Add Comment button
    const addCommentButton = document.getElementById('addCommentButton');
    if (addCommentButton) {
        addCommentButton.addEventListener('click', addComment);
    }

    // Allow pressing Enter to submit comment (with Shift+Enter for new lines)
    const cardComment = document.getElementById('cardComment');
    if (cardComment) {
        cardComment.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                addComment();
            }
        });
    }
});

// Add this function to your existing file
function deleteCard() {
    const modalContent = document.getElementById('cardDetailModalContent');
    const cardID = modalContent.dataset.cardId;

    if (!cardID) return;

    // Only proceed if the user has edit permissions
    if (!canEditBoard()) {
        return;
    }

    deleteCardById(cardID);
}

// Add this function for the actual deletion
async function deleteCardById(cardID) {
    try {
        const response = await fetch('/Card/Delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardID }),
        });

        const data = await response.json();

        if (data.success) {
            // Close the modal
            const modal = document.getElementById('cardDetailModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex', 'items-center', 'justify-center');

            // Refresh lists to show updated board
            const boardId = document.getElementById('boardId').value;
            fetchLists(boardId);
        } else {
            console.error(data.message);
            alert('Error deleting card: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting card:', error);
        alert('An error occurred while deleting the card');
    }
}

// Add this to your window exports at the top of the file
window.deleteCard = deleteCard;