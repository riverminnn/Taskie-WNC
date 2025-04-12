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
            var lists = _listRepository.GetListsByBoardId(boardID);

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
        public IActionResult Add([FromBody] ListModel newList)
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

            return Json(new { success = true, message = "List added successfully!", list = newList });
        }

        [HttpPost]
        [Route("Delete")]
        public IActionResult Delete([FromBody] int listID)
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

        // Model classes
        public class UpdateListNameRequest
        {
            public int ListID { get; set; }
            public string? ListName { get; set; }
        }
    }
}