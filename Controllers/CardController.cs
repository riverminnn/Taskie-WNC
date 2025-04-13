using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using System.Globalization;

namespace TaskieWNC.Controllers
{
    [Route("Card")]
    public class CardController : BaseController
    {
        private readonly CardRepository _cardRepository;
        private readonly ListRepository _listRepository;
        private readonly BoardRepository _boardRepository;
        private readonly CommentRepository _commentRepository;

        public CardController(
            UserRepository userRepository,
            CardRepository cardRepository,
            ListRepository listRepository,
            BoardRepository boardRepository,
            CommentRepository commentRepository) : base(userRepository)
        {
            _cardRepository = cardRepository;
            _listRepository = listRepository;
            _boardRepository = boardRepository;
            _commentRepository = commentRepository;
        }

        [HttpPost]
        [Route("Add")]
        public IActionResult Add([FromBody] CardModel newCard)
        {
            if (newCard == null || string.IsNullOrEmpty(newCard.CardName))
            {
                return Json(new { success = false, message = "Card name is required." });
            }

            // Make sure position is set if not provided
            if (newCard.Position <= 0)
            {
                // Get highest position in list and add 1
                var maxPosition = _cardRepository.GetCardsByListId(newCard.ListID)
                    .Select(c => c.Position)
                    .DefaultIfEmpty(0)
                    .Max();
                newCard.Position = maxPosition + 1;
            }

            // Add the new card to the database
            _cardRepository.AddCard(newCard);

            return Json(new { success = true, message = "Card added successfully!", card = newCard });
        }

        [HttpPost]
        [Route("UpdateStatus")]
        public IActionResult UpdateStatus([FromBody] UpdateCardStatusRequest request)
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
        [Route("GetDetails")]
        public IActionResult GetDetails([FromBody] GetCardDetailsRequest request)
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
        [Route("Update")]
        public IActionResult Update([FromBody] UpdateCardRequest request)
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
        [Route("Delete")]
        public IActionResult Delete([FromBody] DeleteCardRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return Json(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                // Check if user has permission to modify this card
                if (!TryGetUserId(out int userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                // Check if user has edit permissions for this board
                var list = _listRepository.GetListById(card.ListID);
                if (list == null)
                {
                    return Json(new { success = false, message = "List not found." });
                }

                var canEdit = _boardRepository.HasBoardAccess(list.BoardID, userId);
                if (!canEdit)
                {
                    return Json(new { success = false, message = "You don't have permission to delete this card." });
                }

                bool success = _cardRepository.DeleteCard(request.CardID);
                if (success)
                {
                    return Json(new { success = true, message = "Card deleted successfully." });
                }
                else
                {
                    return Json(new { success = false, message = "Failed to delete card." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting card: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("GetComments")]
        public IActionResult GetComments([FromBody] GetCommentsRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return Json(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                var comments = _commentRepository.GetCommentsByTaskId(request.CardID);

                // Get user information for each comment
                var commentData = comments.Select(c => new
                {
                    commentID = c.CommentID,
                    content = c.Content,
                    createdAt = c.CreatedAt,
                    userName = c.User?.FullName ?? "Unknown User",
                    userInitial = c.User?.FullName.FirstOrDefault().ToString().ToUpper() ?? "U",
                    isCurrentUser = c.UserID == userId
                }).ToList();

                return Json(new { success = true, comments = commentData });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error fetching comments: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("AddComment")]
        public IActionResult AddComment([FromBody] AddCommentRequest request)
        {
            if (request == null || request.CardID <= 0 || string.IsNullOrEmpty(request.Content))
            {
                return Json(new { success = false, message = "Invalid comment data." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                // Check if user has permission to comment (must be Owner or Editor)
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                var list = _listRepository.GetListById(card.ListID);
                if (list == null)
                {
                    return Json(new { success = false, message = "List not found." });
                }

                var userRole = _boardRepository.GetUserRoleInBoard(list.BoardID, userId);
                if (userRole != "Owner" && userRole != "Editor")
                {
                    return Json(new { success = false, message = "You don't have permission to comment on this card." });
                }

                var comment = new CommentModel
                {
                    CardID = request.CardID,
                    UserID = userId,
                    Content = request.Content,
                    CreatedAt = DateTime.Now
                };

                _commentRepository.CreateComment(comment);

                var user = _userRepository.GetUserById(userId);

                return Json(new
                {
                    success = true,
                    comment = new
                    {
                        commentID = comment.CommentID,
                        content = comment.Content,
                        createdAt = comment.CreatedAt,
                        userName = user?.FullName ?? "Unknown User",
                        userInitial = user?.FullName.FirstOrDefault().ToString().ToUpper() ?? "U",
                        isCurrentUser = true
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error adding comment: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("DeleteComment")]
        public IActionResult DeleteComment([FromBody] DeleteCommentRequest request)
        {
            if (request == null || request.CommentID <= 0)
            {
                return Json(new { success = false, message = "Invalid comment ID." });
            }

            try
            {
                if (!TryGetUserId(out int userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                var comment = _commentRepository.GetCommentById(request.CommentID);
                if (comment == null)
                {
                    return Json(new { success = false, message = "Comment not found." });
                }

                // Get the card and list to check permissions
                var card = _cardRepository.GetCardById(comment.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Associated card not found." });
                }

                var list = _listRepository.GetListById(card.ListID);
                if (list == null)
                {
                    return Json(new { success = false, message = "Associated list not found." });
                }

                // Check if user is either the comment owner or has edit permission on the board
                var userRole = _boardRepository.GetUserRoleInBoard(list.BoardID, userId);
                bool isCommentOwner = comment.UserID == userId;
                bool canEdit = userRole == "Owner" || userRole == "Editor";

                if (!isCommentOwner && !canEdit)
                {
                    return Json(new { success = false, message = "You don't have permission to delete this comment." });
                }

                // Delete the comment
                bool success = _commentRepository.DeleteComment(request.CommentID);
                if (success)
                {
                    return Json(new { success = true, message = "Comment deleted successfully." });
                }
                else
                {
                    return Json(new { success = false, message = "Failed to delete comment." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting comment: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("MoveToList")]
        public IActionResult MoveToList([FromBody] MoveCardRequest request)
        {
            if (request == null || request.CardID <= 0 || request.ListID <= 0)
            {
                return Json(new { success = false, message = "Invalid request data." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                var sourceList = _listRepository.GetListById(card.ListID);
                var targetList = _listRepository.GetListById(request.ListID);

                if (sourceList == null || targetList == null)
                {
                    return Json(new { success = false, message = "List not found." });
                }

                // Check if both lists belong to the same board
                if (sourceList.BoardID != targetList.BoardID)
                {
                    return Json(new { success = false, message = "Cannot move cards between different boards." });
                }

                // Check if user has edit permission
                if (!UserCanEdit(sourceList.BoardID))
                {
                    return Json(new { success = false, message = "You don't have permission to modify this board." });
                }

                // Move the card to the new list (update ListID)
                card.ListID = request.ListID;

                // Place card at the end of the target list
                int maxPosition = _cardRepository.GetCardsByListId(request.ListID)
                    .Select(c => c.Position)
                    .DefaultIfEmpty(-1)
                    .Max();

                card.Position = maxPosition + 1;

                _cardRepository.UpdateCard(card);

                return Json(new { success = true, message = "Card moved successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error moving card: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("UpdatePositions")]
        public IActionResult UpdatePositions([FromBody] List<CardPositionUpdate> updates)
        {
            if (updates == null || !updates.Any())
            {
                return Json(new { success = false, message = "No position updates provided." });
            }

            try
            {
                // Get the first card to check permissions
                var firstCardId = updates.First().CardID;
                var firstCard = _cardRepository.GetCardById(firstCardId);

                if (firstCard == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                // Get the list to check board permissions
                var list = _listRepository.GetListById(firstCard.ListID);
                if (list == null)
                {
                    return Json(new { success = false, message = "List not found." });
                }

                // Check if user has edit permission for this board
                if (!UserCanEdit(list.BoardID))
                {
                    return Json(new { success = false, message = "You don't have permission to modify this board." });
                }

                // Update all card positions
                foreach (var update in updates)
                {
                    var card = _cardRepository.GetCardById(update.CardID);
                    if (card != null)
                    {
                        card.Position = update.Position;
                        _cardRepository.UpdateCard(card);
                    }
                }

                return Json(new { success = true, message = "Card positions updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating card positions: {ex.Message}" });
            }
        }

        // Add these model classes
        public class CardPositionUpdate
        {
            public int CardID { get; set; }
            public int Position { get; set; }
        }

        public class MoveCardRequest
        {
            public int CardID { get; set; }
            public int ListID { get; set; }
        }

        private bool UserCanEdit(int boardId)
        {
            // Implement your permission check here
            if (!TryGetUserId(out int userId))
            {
                return false;
            }

            return _boardRepository.HasBoardAccess(boardId, userId);
        }

        public class DeleteCommentRequest
        {
            public int CommentID { get; set; }
        }

        public class GetCommentsRequest
        {
            public int CardID { get; set; }
        }

        public class AddCommentRequest
        {
            public int CardID { get; set; }
            public string Content { get; set; } = string.Empty;
        }

        public class DeleteCardRequest
        {
            public int CardID { get; set; }
        }

        // Model classes
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
    }
}