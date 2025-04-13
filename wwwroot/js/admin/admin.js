import { loadUsers, updateUser, deleteUser, showAddUserModal, closeAddUserModal, addUser } from './userAdmin.js';
import { loadLists, updateList, deleteList, showAddListModal, closeAddListModal, addList } from './listAdmin.js';
import { loadComments, updateComment, deleteComment, showAddCommentModal, closeAddCommentModal, addComment } from './commentAdmin.js';
import { loadCards, updateCard, deleteCard, showAddCardModal, closeAddCardModal, addCard } from './cardAdmin.js';
import { loadBoards, updateBoard, deleteBoard, showAddBoardModal, closeAddBoardModal, addBoard } from './boardAdmin.js';
import { loadBoardMembers, updateBoardMemberRole, deleteBoardMember, showAddBoardMemberModal, closeAddBoardMemberModal, addBoardMember } from './boardMember.js';

// Expose these functions to the global scope for inline HTML event handlers
window.loadUsers = loadUsers;
window.updateUser = updateUser;
window.deleteUser = deleteUser;
window.showAddUserModal = showAddUserModal;
window.closeAddUserModal = closeAddUserModal;
window.addUser = addUser;

window.loadLists = loadLists;
window.updateList = updateList;
window.deleteList = deleteList;
window.showAddListModal = showAddListModal;
window.closeAddListModal = closeAddListModal;
window.addList = addList;

window.loadComments = loadComments;
window.updateComment = updateComment;
window.deleteComment = deleteComment;
window.showAddCommentModal = showAddCommentModal;
window.closeAddCommentModal = closeAddCommentModal;
window.addComment = addComment;

window.loadCards = loadCards;
window.updateCard = updateCard;
window.deleteCard = deleteCard;
window.showAddCardModal = showAddCardModal;
window.closeAddCardModal = closeAddCardModal;
window.addCard = addCard;

window.loadBoards = loadBoards;
window.updateBoard = updateBoard;
window.deleteBoard = deleteBoard;
window.showAddBoardModal = showAddBoardModal;
window.closeAddBoardModal = closeAddBoardModal;
window.addBoard = addBoard;

window.loadBoardMembers = loadBoardMembers;
window.updateBoardMemberRole = updateBoardMemberRole;
window.deleteBoardMember = deleteBoardMember;
window.showAddBoardMemberModal = showAddBoardMemberModal;
window.closeAddBoardMemberModal = closeAddBoardMemberModal;
window.addBoardMember = addBoardMember;