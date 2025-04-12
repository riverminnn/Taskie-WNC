using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    [Route("BoardMember")]
    public class BoardMemberController : BaseController
    {
        private readonly BoardRepository _boardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public BoardMemberController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        [HttpPost]
        [Route("GetMembers")]
        public IActionResult GetMembers([FromBody] int boardId)
        {
            if (!TryGetUserId(out int userId))
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
                members = members,
                owner = new
                {
                    userID = ownerInfo.UserID,
                    email = ownerInfo.Email,
                    fullname = ownerInfo.FullName
                }
            });
        }

        [HttpPost]
        [Route("Invite")]
        public IActionResult Invite([FromBody] InviteMemberRequest request)
        {
            if (!TryGetUserId(out int userId))
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
        [Route("Remove")]
        public IActionResult Remove([FromBody] RemoveMemberRequest request)
        {
            if (!TryGetUserId(out int userId))
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

        [HttpPost]
        [Route("UpdateRole")]
        public IActionResult UpdateRole([FromBody] UpdateMemberRoleRequest request)
        {
            if (!TryGetUserId(out int userId))
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
                return Json(new { success = false, message = "Only board owners can change member roles." });
            }

            // Update the role
            bool success = _boardMemberRepository.UpdateBoardMemberRole(request.BoardId, request.UserId, request.Role ?? "Editor");

            if (success)
            {
                return Json(new { success = true, message = "Member role updated successfully." });
            }
            else
            {
                return Json(new { success = false, message = "Failed to update member role." });
            }
        }

        // Model classes
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

        public class UpdateMemberRoleRequest
        {
            public int BoardId { get; set; }
            public int UserId { get; set; }
            public string? Role { get; set; }
        }
    }
}