/**
 * boardDetail.js - Board detail page functionality
 * 
 * This file imports all the modular components for the board detail page.
 * Each module encapsulates a specific area of functionality.
 */

// Import modules
import { SELECTORS } from './board/constants.js';
import * as Modals from './board/modals.js';
import * as Lists from './board/lists.js';
import * as Cards from './board/cards.js';
import * as Permissions from './board/permissions.js';
import * as Sharing from './board/sharing.js';
import * as Board from './board/board.js';
import * as Events from './board/events.js';

// Make functions available in the global scope for inline HTML event handlers
window.openNewListModal = Modals.openNewListModal;
window.closeNewListModal = Modals.closeNewListModal;
window.openNewCardModal = Modals.openNewCardModal;
window.closeNewCardModal = Modals.closeNewCardModal;

window.fetchLists = Lists.fetchLists;
window.addList = Lists.addList;
window.setupListNameEditing = Lists.setupListNameEditing;
window.toggleListDropdown = Lists.toggleListDropdown;
window.deleteList = Lists.deleteList;

window.addCard = Cards.addCard;
window.toggleCardStatus = Cards.toggleCardStatus;

window.openShareModal = Sharing.openShareModal;
window.closeShareModal = Sharing.closeShareModal;
window.loadBoardMembers = Sharing.loadBoardMembers;
window.inviteUser = Sharing.inviteUser;
window.removeBoardMember = Sharing.removeBoardMember;
window.updateMemberRole = Sharing.updateMemberRole;
window.handleRoleChange = Sharing.handleRoleChange;

window.deleteBoard = Board.deleteBoard;
window.toggleSettingsDropdown = Board.toggleSettingsDropdown;
window.canEditBoard = Permissions.canEditBoard;

// Initialize the board
document.addEventListener('DOMContentLoaded', () => {
    const boardID = document.querySelector(SELECTORS.BOARD_ID).value;
    const boardName = document.querySelector(SELECTORS.BOARD_NAME).value;

    // Track this board visit for recent boards
    if (typeof trackBoardVisit === 'function') {
        trackBoardVisit(boardID, boardName);
    }

    // Setup the board
    Lists.fetchLists(boardID);
    Board.setupBoardNameEditing();
    Events.setupEventListeners();
    Permissions.applyRoleBasedPermissions();
});

// Maintain the toggleBoardStar function for the star feature
function toggleBoardStar() {
    const boardId = document.querySelector(SELECTORS.BOARD_ID).value;
    const boardName = document.querySelector(SELECTORS.BOARD_NAME).value;

    // Call the toggleStarredStatus function from starredBoards.js
    const isStarred = toggleStarredStatus(boardId, boardName);

    // Update the star icon
    updateStarIcon(isStarred);

    // Update the dropdown
    updateStarredBoardsDropdown();
}

// Export this function for the global scope
window.toggleBoardStar = toggleBoardStar;