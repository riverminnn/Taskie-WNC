using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    [Route("Board")]
    public class BoardController : BaseController
    {
        private readonly BoardRepository _boardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public BoardController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        [HttpGet]
        [Route("{boardId}/{boardName}")]
        public IActionResult Detail(int boardId, string boardName)
        {
            var loginCheck = RequireLogin();
            if (!(loginCheck is EmptyResult)) return loginCheck;

            if (!TryGetUserId(out int userId))
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

            // Determine user's role
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

            return View("~/Views/User/BoardDetail.cshtml", board);
        }

        [HttpPost]
        [Route("GetBoards")]
        public IActionResult GetBoards()
        {
            // Get the current user's ID from the session
            if (!TryGetUserId(out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            // Fetch boards owned by the logged-in user
            var ownedBoards = _boardRepository.GetBoardsByUserId(userId);

            // Fetch boards where the user is a member but not the owner
            var sharedBoards = _boardRepository.GetSharedBoardsByUserId(userId);

            // Return both types of boards as JSON
            return Json(new
            {
                success = true,
                ownedBoards = ownedBoards,
                sharedBoards = sharedBoards
            });
        }

        [HttpPost]
        [Route("Create")]
        public IActionResult Create([FromBody] BoardModel newBoard)
        {
            if (!TryGetUserId(out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            newBoard.UserID = userId;
            _boardRepository.AddBoard(newBoard);

            return Json(new { success = true, message = "Board created successfully!", board = newBoard });
        }

        [HttpPost]
        [Route("Delete")]
        public IActionResult Delete([FromBody] DeleteBoardRequest request)
        {
            if (request == null || request.BoardId <= 0)
            {
                return Json(new { success = false, message = "Invalid board ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                var board = _boardRepository.GetBoardById(request.BoardId);
                if (board == null)
                {
                    return Json(new { success = false, message = "Board not found." });
                }

                // Check if user owns the board
                if (board.UserID != userId)
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
        [Route("UpdateName")]
        public IActionResult UpdateName([FromBody] UpdateBoardNameRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.BoardName))
            {
                return Json(new { success = false, message = "Board name cannot be empty." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                var board = _boardRepository.GetBoardById(request.BoardId);
                if (board == null)
                {
                    return Json(new { success = false, message = "Board not found." });
                }

                // Make sure user has rights to this board
                if (board.UserID != userId)
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

        // Model classes
        public class DeleteBoardRequest
        {
            public int BoardId { get; set; }
        }

        public class UpdateBoardNameRequest
        {
            public int BoardId { get; set; }
            public string? BoardName { get; set; }
        }
    }
}