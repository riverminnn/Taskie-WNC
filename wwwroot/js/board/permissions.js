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
 * Disables editing features based on user role
 * [PERM-APPLY] - This is where all editor/viewer permissions are applied
 */
export function applyRoleBasedPermissions() {
    const isEditor = canEditBoard();

    // Hide or disable elements for viewers
    if (!isEditor) {
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

        // Add view-only indicator to card detail modal
        const cardDetailModal = document.getElementById('cardDetailModal');
        const cardDetailHeader = cardDetailModal.querySelector('.flex.items-center.justify-between.mb-4');
        if (cardDetailHeader) {
            // Create view-only badge if it doesn't exist
            if (!document.getElementById('view-only-badge')) {
                const viewOnlyBadge = document.createElement('div');
                viewOnlyBadge.id = 'view-only-badge';
                viewOnlyBadge.className = 'px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium';
                viewOnlyBadge.textContent = 'View Only';
                cardDetailHeader.appendChild(viewOnlyBadge);
            }
        }
    }
}