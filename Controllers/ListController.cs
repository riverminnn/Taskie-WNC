using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    [Route("List")]
    public class ListController : BaseController
    {
        private readonly BoardRepository _boardRepository;
        private readonly ListRepository _listRepository;
        private readonly CardRepository _cardRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public ListController(
            UserRepository userRepository,
            BoardRepository boardRepository,
            ListRepository listRepository,
            CardRepository cardRepository,
            BoardMemberRepository boardMemberRepository) : base(userRepository)
        {
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        [HttpPost]
        [Route("GetLists")]
        public IActionResult GetLists([FromBody] int boardID)
        {
            var lists = _listRepository.GetListsByBoardId(boardID)
                                      .OrderBy(l => l.Position) // Make sure lists are ordered by position
                                      .ToList();

            // Include cards for each list
            var listsWithCards = lists.Select(list => new
            {
                list.ListID,
                list.ListName,
                list.Position,
                Cards = _cardRepository.GetCardsByListId(list.ListID)
            }).ToList();

            return Json(new { success = true, lists = listsWithCards });
        }

        [HttpPost]
        [Route("Add")]
        public IActionResult Add([FromBody] AddListRequest request)
        {
            try
            {
                // Check if user has permission to add list
                if (!UserCanEdit(request.BoardId))
                {
                    return Json(new { success = false, message = "You don't have permission to add lists to this board" });
                }

                var list = new ListModel
                {
                    ListName = request.ListName ?? "Unknown Listname",
                    BoardID = request.BoardId,
                    Position = request.Position // Use the position from the request
                };

                _listRepository.AddList(list);

                return Json(new { success = true, message = "List added successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Failed to add list: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("Delete")]
        public IActionResult Delete([FromBody] int listID)
        {
            try
            {
                // Get the board ID for this list
                var list = _listRepository.GetListById(listID);
                if (list == null)
                    return Json(new { success = false, message = "List not found." });

                // Check if user has edit permission
                if (!UserCanEdit(list.BoardID))
                    return Json(new { success = false, message = "You don't have permission to delete this list." });

                _listRepository.DeleteList(listID);
                return Json(new { success = true, message = "List deleted successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Failed to delete list: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("UpdateName")]
        public IActionResult UpdateName([FromBody] UpdateListNameRequest request)
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

        private bool UserCanEdit(int boardId)
        {
            if (!TryGetUserId(out int userId))
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
        [HttpPost]
        [Route("UpdatePositions")]
        public IActionResult UpdatePositions([FromBody] List<ListPositionUpdate> updates)
        {
            if (updates == null || !updates.Any())
            {
                return Json(new { success = false, message = "No position updates provided." });
            }

            try
            {
                // Get the board ID from the first list to check permissions
                var firstListId = updates.First().ListID;
                var firstList = _listRepository.GetListById(firstListId);

                if (firstList == null)
                {
                    return Json(new { success = false, message = "List not found." });
                }

                // Check if user has edit permission
                if (!UserCanEdit(firstList.BoardID))
                {
                    return Json(new { success = false, message = "You don't have permission to modify this board." });
                }

                // Update all list positions
                foreach (var update in updates)
                {
                    var list = _listRepository.GetListById(update.ListID);
                    if (list != null)
                    {
                        list.Position = update.Position;
                        _listRepository.UpdateList(list);
                    }
                }

                return Json(new { success = true, message = "List positions updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating list positions: {ex.Message}" });
            }
        }

        // Also update your request model
        public class AddListRequest
        {
            public string? ListName { get; set; }
            public int BoardId { get; set; }
            public int Position { get; set; }
        }

        // Add this model class inside ListController
        public class ListPositionUpdate
        {
            public int ListID { get; set; }
            public int Position { get; set; }
        }

        // Model classes
        public class UpdateListNameRequest
        {
            public int ListID { get; set; }
            public string? ListName { get; set; }
        }
    }
}