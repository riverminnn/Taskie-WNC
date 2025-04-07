using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Services;
using System.Globalization;

namespace TaskieWNC.Controllers
{
    [Route("User")]
    public class UserController : Controller
    {
        private readonly UserRepository _userRepository;
        private readonly BoardRepository _boardRepository;
        private readonly ListRepository _listRepository;
        private readonly CardRepository _cardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        // Constants
        private const string VIEW_NOT_FOUND = "NotFound";
        private const string SESSION_USER_ID = "UserID";
        private const string SESSION_EMAIL = "Email";

        public UserController(UserRepository userRepository, BoardRepository boardRepository,
         ListRepository listRepository, CardRepository cardRepository, BoardMemberRepository boardMemberRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        [HttpGet]
        [Route("Home")]
        public IActionResult Home()
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString(SESSION_EMAIL)))
            {
                return View(VIEW_NOT_FOUND);
            }

            return View();
        }

        [HttpGet]
        [Route("{boardId}/{boardName}")]
        public IActionResult BoardDetail(int boardId, string boardName)
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString(SESSION_EMAIL)))
            {
                return View(VIEW_NOT_FOUND);
            }

            string? userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return View(VIEW_NOT_FOUND);
            }

            // Check if user has access to the board
            if (!_boardRepository.HasBoardAccess(boardId, userId))
            {
                return View(VIEW_NOT_FOUND);
            }

            var board = _boardRepository.GetBoardById(boardId);
            if (board == null)
            {
                return View(VIEW_NOT_FOUND);
            }

            ViewData["BoardID"] = boardId;
            ViewData["BoardName"] = board.BoardName;

            // Determine user's role - owner or board member
            bool isOwner = (board.UserID == userId);
            ViewData["IsOwner"] = isOwner;

            string userRole = "Viewer"; // Default to most restrictive
            if (isOwner)
            {
                userRole = "Owner"; // Owner has full rights
            }
            else
            {
                // Check if user is a member and get their role
                var membership = _boardMemberRepository.GetBoardMembership(boardId, userId);
                if (membership != null)
                {
                    userRole = membership.Role;
                }
            }

            ViewData["UserRole"] = userRole;

            return View(board);
        }

        [HttpPost]
        [Route("GetBoards")]
        public IActionResult GetBoards()
        {
            // Get the current user's ID from the session
            var userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            if (!int.TryParse(userIdStr, out int parsedUserId))
            {
                return Json(new { success = false, message = "Invalid user ID." });
            }

            // Fetch boards owned by the logged-in user
            var ownedBoards = _boardRepository.GetBoardsByUserId(parsedUserId);

            // Fetch boards where the user is a member but not the owner
            var sharedBoards = _boardRepository.GetSharedBoardsByUserId(parsedUserId);

            // Return both types of boards as JSON
            return Json(new
            {
                success = true,
                ownedBoards = ownedBoards,
                sharedBoards = sharedBoards
            });
        }

        [HttpPost]
        [Route("CreateBoard")]
        public IActionResult CreateBoard([FromBody] BoardModel newBoard)
        {
            // Get the current user's ID from the session
            var userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            newBoard.UserID = userId;
            _boardRepository.AddBoard(newBoard);

            // Return success response
            return Json(new { success = true, message = "Board created successfully!", board = newBoard });
        }

        [HttpPost]
        [Route("DeleteBoard")]
        public IActionResult DeleteBoard([FromBody] DeleteBoardRequest request)
        {
            if (request == null || request.BoardId <= 0)
            {
                return Json(new { success = false, message = "Invalid board ID." });
            }

            try
            {
                var board = _boardRepository.GetBoardById(request.BoardId);
                if (board == null)
                {
                    return Json(new { success = false, message = "Board not found." });
                }

                // Check if user owns the board
                var userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId) || board.UserID != userId)
                {
                    return Json(new { success = false, message = "You don't have permission to delete this board." });
                }

                // Delete the board
                _boardRepository.DeleteBoard(request.BoardId);

                return Json(new { success = true, message = "Board deleted successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting board: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("GetLists")]
        public IActionResult GetLists([FromBody] int boardID)
        {
            var lists = _listRepository.GetListsByBoardId(boardID);

            // Include cards for each list
            var listsWithCards = lists.Select(list => new
            {
                list.ListID,
                list.ListName,
                list.Position,
                Cards = _cardRepository.GetCardsByListId(list.ListID) // Fetch cards for each list
            }).ToList();

            return Json(new { success = true, lists = listsWithCards });
        }

        [HttpPost]
        [Route("AddList")]
        public IActionResult AddList([FromBody] ListModel newList)
        {
            if (!UserCanEdit(newList.BoardID))
            {
                return Json(new { success = false, message = "You don't have permission to modify this board." });
            }
            if (newList == null || string.IsNullOrEmpty(newList.ListName))
            {
                return Json(new { success = false, message = "List name is required." });
            }

            // Add the new list to the database
            _listRepository.AddList(newList);

            // Return success response
            return Json(new { success = true, message = "List added successfully!", list = newList });
        }

        [HttpPost]
        [Route("AddCard")]
        public IActionResult AddCard([FromBody] CardModel newCard)
        {
            if (newCard == null || string.IsNullOrEmpty(newCard.CardName))
            {
                return Json(new { success = false, message = "Card name is required." });
            }

            // Add the new card to the database
            _cardRepository.AddCard(newCard);

            // Return success response
            return Json(new { success = true, message = "Card added successfully!", card = newCard });
        }

        [HttpPost]
        [Route("DeleteList")]
        public IActionResult DeleteList([FromBody] int listID)
        {
            try
            {
                _listRepository.DeleteList(listID);
                return Json(new { success = true, message = "List deleted successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Failed to delete list: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("UpdateBoardName")]
        public IActionResult UpdateBoardName([FromBody] UpdateBoardNameRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.BoardName))
            {
                return Json(new { success = false, message = "Board name cannot be empty." });
            }

            try
            {
                var board = _boardRepository.GetBoardById(request.BoardId);
                if (board == null)
                {
                    return Json(new { success = false, message = "Board not found." });
                }

                // Make sure user has rights to this board
                var userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId) || board.UserID != userId)
                {
                    return Json(new { success = false, message = "You don't have permission to update this board." });
                }

                // Update board name
                board.BoardName = request.BoardName;
                _boardRepository.UpdateBoard(board);

                return Json(new { success = true, message = "Board name updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating board name: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("UpdateListName")]
        public IActionResult UpdateListName([FromBody] UpdateListNameRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.ListName))
            {
                return Json(new { success = false, message = "List name cannot be empty." });
            }

            try
            {
                var list = _listRepository.GetListById(request.ListID);
                if (list == null)
                {
                    return Json(new { success = false, message = "List not found." });
                }

                // Update list name
                list.ListName = request.ListName;
                _listRepository.UpdateList(list);

                return Json(new { success = true, message = "List name updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating list name: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("UpdateCardStatus")]
        public IActionResult UpdateCardStatus([FromBody] UpdateCardStatusRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return Json(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                // Update card status
                card.Status = request.Status ?? "To Do";
                _cardRepository.UpdateCard(card);

                return Json(new { success = true, message = "Card status updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating card status: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("GetCardDetails")]
        public IActionResult GetCardDetails([FromBody] GetCardDetailsRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return Json(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                return Json(new { success = true, card });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error fetching card details: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("UpdateCard")]
        public IActionResult UpdateCard([FromBody] UpdateCardRequest request)
        {
            if (request == null || request.CardID <= 0 || string.IsNullOrEmpty(request.CardName))
            {
                return Json(new { success = false, message = "Invalid card data." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                // Update card properties
                card.CardName = request.CardName;
                card.Description = request.Description ?? string.Empty;
                card.Status = request.Status ?? "To Do";

                if (!string.IsNullOrEmpty(request.DueDate))
                {
                    card.DueDate = DateTime.Parse(request.DueDate, CultureInfo.InvariantCulture);
                }
                else
                {
                    card.DueDate = null;
                }

                // Save updates
                _cardRepository.UpdateCard(card);

                return Json(new { success = true, message = "Card updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating card: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("GetBoardMembers")]
        public IActionResult GetBoardMembers([FromBody] int boardId)
        {
            string? userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            // Check if user has access to the board
            if (!_boardRepository.HasBoardAccess(boardId, userId))
            {
                return Json(new { success = false, message = "You don't have access to this board." });
            }

            var members = _boardMemberRepository.GetBoardMembers(boardId);

            // Include the board owner too
            var board = _boardRepository.GetBoardById(boardId);
            if (board == null)
            {
                return Json(new { success = false, message = "Board not found." });
            }

            var ownerInfo = _userRepository.GetUserById(board.UserID);
            if (ownerInfo == null)
            {
                return Json(new { success = false, message = "Board owner information not found." });
            }

            return Json(new
            {
                success = true,
                members = members, // This now contains the joined data with User information
                owner = new
                {
                    userID = ownerInfo.UserID,
                    email = ownerInfo.Email,
                    fullname = ownerInfo.FullName
                }
            });
        }

        [HttpPost]
        [Route("InviteUserToBoard")]
        public IActionResult InviteUserToBoard([FromBody] InviteMemberRequest request)
        {
            string? userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            if (request == null)
            {
                return Json(new { success = false, message = "Invalid request." });
            }

            // Check if user is the board owner
            var board = _boardRepository.GetBoardById(request.BoardId);
            if (board == null || board.UserID != userId)
            {
                return Json(new { success = false, message = "Only board owners can invite members." });
            }

            // Find the user to invite
            var userToInvite = _userRepository.GetUserByEmail(request.Email);
            if (userToInvite == null)
            {
                return Json(new { success = false, message = "User not found." });
            }

            // Check if user is already a member
            if (_boardMemberRepository.IsBoardMember(request.BoardId, userToInvite.UserID))
            {
                return Json(new { success = false, message = "User is already a board member." });
            }

            // Add the user as a board member
            var newMember = new BoardMemberModel
            {
                BoardID = request.BoardId,
                UserID = userToInvite.UserID,
                Role = request.Role ?? "Editor"
            };

            _boardMemberRepository.AddBoardMember(newMember);

            return Json(new { success = true, message = "User has been invited to the board." });
        }

        [HttpPost]
        [Route("RemoveBoardMember")]
        public IActionResult RemoveBoardMember([FromBody] RemoveMemberRequest request)
        {
            string? userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            if (request == null)
            {
                return Json(new { success = false, message = "Invalid request." });
            }

            // Check if user is the board owner
            var board = _boardRepository.GetBoardById(request.BoardId);
            if (board == null || board.UserID != userId)
            {
                return Json(new { success = false, message = "Only board owners can remove members." });
            }

            // Remove the member
            bool success = _boardMemberRepository.RemoveBoardMember(request.BoardId, request.UserIdToRemove);

            if (success)
            {
                return Json(new { success = true, message = "Member removed successfully." });
            }
            else
            {
                return Json(new { success = false, message = "Failed to remove member." });
            }
        }

        private bool UserCanEdit(int boardId)
        {
            string? userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return false;
            }

            var board = _boardRepository.GetBoardById(boardId);
            if (board == null) return false;

            // Owner has full rights
            if (board.UserID == userId) return true;

            // Check if user is an editor
            var membership = _boardMemberRepository.GetBoardMembership(boardId, userId);
            return membership != null && membership.Role == "Editor";
        }

        public class InviteMemberRequest
        {
            public int BoardId { get; set; }
            public required string Email { get; set; }
            public string? Role { get; set; }
        }

        public class RemoveMemberRequest
        {
            public int BoardId { get; set; }
            public int UserIdToRemove { get; set; }
        }

        public class DeleteBoardRequest
        {
            public int BoardId { get; set; }
        }

        public class GetCardDetailsRequest
        {
            public int CardID { get; set; }
        }

        public class UpdateCardRequest
        {
            public int CardID { get; set; }
            public string? CardName { get; set; }
            public string? Description { get; set; }
            public string? DueDate { get; set; }
            public string? Status { get; set; }
        }

        public class UpdateCardStatusRequest
        {
            public int CardID { get; set; }
            public string? Status { get; set; }
        }

        public class UpdateListNameRequest
        {
            public int ListID { get; set; }
            public string? ListName { get; set; }
        }

        public class UpdateBoardNameRequest
        {
            public int BoardId { get; set; }
            public string? BoardName { get; set; }
        }
    }
}