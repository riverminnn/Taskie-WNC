import { SELECTORS } from './constants.js';

/**
 * Checks if the current user can edit the board
 * @returns {boolean} - True if user can edit, false otherwise
 */
export function canEditBoard() {
    const role = document.querySelector(SELECTORS.USER_ROLE).value;
    return role === 'Owner' || role === 'Editor';
}

/**
 * Main function to apply all role-based permissions
 * [PERM-APPLY] - This is where all editor/viewer permissions are applied
 */
export function applyRoleBasedPermissions() {
    const isEditor = canEditBoard();

    // Only apply restrictions for viewers
    if (!isEditor) {
        applyCommentPermissions();
        applyListPermissions();
        applyBoardPermissions();
        applyCardDetailPermissions();
        applyCardInteractionPermissions();
        applyMiscPermissions();

        // Add this observer to catch elements added dynamically
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Check for newly added buttons
                    const newButtons = document.querySelectorAll(SELECTORS.CARD_BUTTONS);
                    if (newButtons.length > 0) {
                        console.log('Found', newButtons.length, 'card buttons after DOM update');
                        newButtons.forEach(button => {
                            button.classList.add('hidden');
                            button.style.display = 'none';
                            button.removeAttribute('onclick');
                        });
                    }
                }
            });
        });

        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

/**
 * Applies permissions for comment functionality
 */
function applyCommentPermissions() {
    const commentForm = document.getElementById('commentForm');
    const cardComment = document.getElementById('cardComment');

    if (commentForm && cardComment) {
        // Hide the comment form for viewers
        commentForm.innerHTML = '<p class="text-xs text-gray-500 italic mb-3">Only board owners and editors can add comments</p>';
    }
}

/**
 * Applies permissions for list-related elements
 */
function applyListPermissions() {
    // [PERM-HIDE-ADDLIST] Hide "Add another list" button
    const addListButton = document.getElementById('addListButton');
    if (addListButton) addListButton.classList.add('hidden');

    // [PERM-HIDE-ADDCARD] Hide all "Add a card" buttons
    const addCardButtons = document.querySelectorAll(SELECTORS.CARD_BUTTONS);
    addCardButtons.forEach(button => button.classList.add('hidden'));

    // [PERM-HIDE-LISTS] Hide all list setting buttons
    const listSettingsButtons = document.querySelectorAll(SELECTORS.LIST_SETTINGS);
    listSettingsButtons.forEach(button => {
        button.classList.add('hidden');
        // Remove onclick attribute to prevent JavaScript execution
        button.removeAttribute('onclick');
    });

    // [PERM-HIDE-DROPDOWNS] Completely hide and disable all list dropdowns
    const listDropdowns = document.querySelectorAll('[id^="list-dropdown-"]');
    listDropdowns.forEach(dropdown => {
        // Hide it with CSS
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
        dropdown.style.visibility = 'hidden';
        dropdown.style.pointerEvents = 'none';

        // Clone and replace to remove event listeners
        const parent = dropdown.parentNode;
        const clone = dropdown.cloneNode(true);

        // Remove all onclick attributes from buttons inside
        clone.querySelectorAll('button').forEach(btn => {
            btn.removeAttribute('onclick');
            btn.style.pointerEvents = 'none';
        });

        parent.replaceChild(clone, dropdown);
    });

    // [PERM-READONLY] Make all list name inputs completely uneditable
    const listNameInputs = document.querySelectorAll('[id^="list-name-"]');
    listNameInputs.forEach(input => {
        // Make readonly
        input.setAttribute('readonly', true);
        input.setAttribute('tabindex', '-1');
        input.setAttribute('aria-readonly', 'true');

        // Apply CSS styling to make it look non-editable
        input.classList.add('cursor-default', 'select-none');
        input.classList.remove('hover:bg-gray-100');
        input.style.userSelect = 'none';
        input.style.webkitUserSelect = 'none';
        input.style.msUserSelect = 'none';

        // Remove all event listeners by cloning and replacing
        const parent = input.parentNode;
        const clone = input.cloneNode(true);
        parent.replaceChild(clone, input);
    });

    // Add a global event listener to prevent any attempts to toggle list dropdowns
    document.addEventListener('click', function (event) {
        // Check if the clicked element is related to list settings
        if (event.target.id?.startsWith('list-settings-') ||
            event.target.closest('[id^="list-settings-"]') ||
            event.target.closest('[id^="list-dropdown-"]')) {

            // Stop the event completely
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true); // Use capture phase to intercept events before they reach targets

    // Prevent any attempts to edit list names
    document.addEventListener('dblclick', function (event) {
        if (event.target.id?.startsWith('list-name-')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);

    // Prevent keyboard access to list name inputs
    document.addEventListener('keydown', function (event) {
        const target = event.target;
        if (target.id?.startsWith('list-name-') && event.key !== 'Tab') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
}


/**
 * Applies permissions for board-related elements
 */
function applyBoardPermissions() {
    // Make board name input readonly
    const boardNameInput = document.querySelector(SELECTORS.BOARD_NAME);
    if (boardNameInput) {
        boardNameInput.setAttribute('readonly', true);
        boardNameInput.classList.add('cursor-default');
    }

    // Disable settings button
    const settingsButton = document.getElementById('settings');
    if (settingsButton) settingsButton.classList.add('hidden');

    // Make share button view-only
    const shareButton = document.getElementById('shareBoard');
    if (shareButton) {
        shareButton.innerHTML = '<i class="fa-solid fa-users mr-1"></i> View Members';
    }
}

/**
 * Applies permissions for card detail modal and card interactions
 */
function applyCardDetailPermissions() {
    // Add view-only indicator to card detail modal
    const cardDetailModal = document.getElementById('cardDetailModal');
    if (!cardDetailModal) return;

    // Create view-only badge if it doesn't exist
    const cardDetailHeader = cardDetailModal.querySelector('.flex.items-center.justify-between.mb-4');
    if (cardDetailHeader && !document.getElementById('view-only-badge')) {
        const viewOnlyBadge = document.createElement('div');
        viewOnlyBadge.id = 'view-only-badge';
        viewOnlyBadge.className = 'px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium absolute right-0 top-8';
        viewOnlyBadge.textContent = 'View Only';
        cardDetailHeader.appendChild(viewOnlyBadge);
    }

    // Make card name input read-only
    const cardNameInput = cardDetailModal.querySelector('#cardDetailName');
    if (cardNameInput) {
        cardNameInput.setAttribute('readonly', true);
        cardNameInput.setAttribute('tabindex', '-1');
        cardNameInput.setAttribute('aria-readonly', 'true');
        cardNameInput.classList.add('cursor-default', 'select-none');
        cardNameInput.style.userSelect = 'none';
        cardNameInput.style.background = '#f2f2f2';
    }

    // Disable description editing
    const descriptionTextarea = cardDetailModal.querySelector('#cardDetailDescription');
    if (descriptionTextarea) {
        descriptionTextarea.setAttribute('readonly', true);
        descriptionTextarea.setAttribute('tabindex', '-1');
        descriptionTextarea.setAttribute('aria-readonly', 'true');
        descriptionTextarea.classList.add('cursor-default');
        descriptionTextarea.style.background = '#f2f2f2';
    }

    // Hide edit buttons
    const editButtons = cardDetailModal.querySelectorAll('.edit-button, .save-button');
    editButtons.forEach(button => {
        button.classList.add('hidden');
    });

    // Disable due date input
    const dueDateInput = cardDetailModal.querySelector('#cardDetailDueDate');
    if (dueDateInput) {
        dueDateInput.setAttribute('disabled', true);
        dueDateInput.classList.add('cursor-not-allowed', 'bg-gray-100');
    }

    // Apply permissions to all cards in the board
    applyCardInteractionPermissions();
}

/**
 * Disables card interactions for viewers
 */
function applyCardInteractionPermissions() {
    // Disable status toggle on all cards
    const statusToggles = document.querySelectorAll('.status-toggle');
    statusToggles.forEach(toggle => {
        // Remove onclick handlers
        const originalElement = toggle;
        const newElement = toggle.cloneNode(true);
        originalElement.parentNode.replaceChild(newElement, originalElement);

        // Add visual indicator that it's not interactive
        newElement.classList.add('cursor-not-allowed', 'opacity-50');
        newElement.style.pointerEvents = 'none';
    });

    // Make cards appear non-interactive
    const cardItems = document.querySelectorAll('[id^="card-item-"]');
    cardItems.forEach(card => {
        // Apply visual styling for read-only cards
        card.classList.add('read-only-card');
        card.style.cursor = 'default';

        // Add a subtle visual indicator
        if (!card.querySelector('.view-only-indicator')) {
            const viewIndicator = document.createElement('span');
            viewIndicator.className = 'view-only-indicator text-xs text-gray-400 absolute right-2 bottom-1';
            viewIndicator.innerHTML = '<i class="fas fa-eye"></i>';
            viewIndicator.style.fontSize = '10px';
            card.style.position = 'relative';
            card.appendChild(viewIndicator);
        }
    });

    // Add global event listeners to prevent unauthorized card interactions
    document.addEventListener('click', function (event) {
        // Check if clicked element is related to card status toggle
        if (event.target.closest('.status-toggle')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);

    // Override the toggleCardStatus function
    window.toggleCardStatus = function (cardID) {
        console.log('Card status changes are not allowed for viewers');
        return false;
    };

    // Also disable any direct function calls to update card properties
    const originalUpdateCardStatus = window.updateCardStatus || function () { };
    window.updateCardStatus = function () {
        console.log('Updating card status is not allowed for viewers');
        return false;
    };

    // Disable drag-and-drop if implemented
    const draggableCards = document.querySelectorAll('.draggable-card');
    draggableCards.forEach(card => {
        card.setAttribute('draggable', 'false');
        card.classList.remove('draggable-card');
    });

    // Override the addCard function
    window.addCard = function () {
        console.log('Adding cards is not allowed for viewers');
        return false;
    };

    // Override the openNewCardModal function
    window.openNewCardModal = function () {
        console.log('Adding cards is not allowed for viewers');
        return false;
    };

    // Override the closeNewCardModal function (for completeness)
    window.closeNewCardModal = function () {
        console.log('Action not available for viewers');
        return false;
    };
}

/**
 * Applies miscellaneous permissions for other UI elements
 */
function applyMiscPermissions() {
    // Add any other permission-based UI changes here
    // This helps keep the code organized as new features are added
}