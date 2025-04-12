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
        applyMiscPermissions();
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
    listSettingsButtons.forEach(button => button.classList.add('hidden'));

    // [PERM-READONLY] Make all list name inputs readonly
    const listNameInputs = document.querySelectorAll(SELECTORS.LIST_NAMES);
    listNameInputs.forEach(input => {
        input.setAttribute('readonly', true);
        input.classList.add('cursor-default');
        input.classList.remove('hover:bg-gray-100');
    });
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
 * Applies permissions for card detail modal
 */
function applyCardDetailPermissions() {
    const cardDetailModal = document.getElementById('cardDetailModal');
    if (!cardDetailModal) return;

    // Add view-only indicator to card detail modal
    const cardDetailHeader = cardDetailModal.querySelector('.flex.items-center.justify-between.mb-4');
    if (cardDetailHeader) {
        // Create view-only badge if it doesn't exist
        if (!document.getElementById('view-only-badge')) {
            const viewOnlyBadge = document.createElement('div');
            viewOnlyBadge.id = 'view-only-badge';
            viewOnlyBadge.className = 'px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium absolute right-0 top-8';
            viewOnlyBadge.textContent = 'View Only';
            cardDetailHeader.appendChild(viewOnlyBadge);
        }
    }
}

/**
 * Applies miscellaneous permissions for other UI elements
 */
function applyMiscPermissions() {
    // Add any other permission-based UI changes here
    // This helps keep the code organized as new features are added
}