using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    public class UserController : Controller
    {
        private readonly UserRepository _userRepository;
        private readonly BoardRepository _boardRepository;
        private readonly ListRepository _listRepository;
        private readonly CardRepository _cardRepository;

        public UserController(UserRepository userRepository, BoardRepository boardRepository, ListRepository listRepository, CardRepository cardRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
        }

        public IActionResult Home()
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString("Email")))
            {
                // Redirect to a "Page Not Found" view if the user is not logged in
                return View("NotFound");
            }

            // Render the Home view for logged-in users
            return View();
        }

        [Route("User/{boardId}/{boardName}")]
        public IActionResult BoardDetail(int boardId, string boardName)
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString("Email")))
            {
                return View("NotFound");
            }

            var board = _boardRepository.GetBoardById(boardId);
            if (board == null)
            {
                return View("NotFound");
            }

            ViewData["BoardID"] = boardId;
            ViewData["BoardName"] = board.BoardName;
            return View(board);
        }

        [HttpPost]
        public IActionResult GetBoards()
        {
            // Get the current user's ID from the session
            var userId = HttpContext.Session.GetString("UserID");
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            // Fetch boards for the logged-in user
            var boards = _boardRepository.GetBoardsByUserId(int.Parse(userId));

            // Return the boards as JSON
            return Json(new { success = true, boards });
        }

        [HttpPost]
        public IActionResult CreateBoard([FromBody] BoardModel newBoard)
        {
            // Get the current user's ID from the session
            var userId = HttpContext.Session.GetString("UserID");
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            newBoard.UserID = int.Parse(userId);
            _boardRepository.AddBoard(newBoard);

            // Return success response
            return Json(new { success = true, message = "Board created successfully!", board = newBoard });
        }
        [HttpPost]
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
        public IActionResult AddList([FromBody] ListModel newList)
        {
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
        public IActionResult UpdateBoardName([FromBody] UpdateBoardNameRequest request)
        {
            if (string.IsNullOrEmpty(request.BoardName))
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
                var userId = HttpContext.Session.GetString("UserID");
                if (board.UserID != int.Parse(userId))
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
        public IActionResult UpdateListName([FromBody] UpdateListNameRequest request)
        {
            if (string.IsNullOrEmpty(request.ListName))
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
                card.Status = request.Status;
                _cardRepository.UpdateCard(card);

                return Json(new { success = true, message = "Card status updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating card status: {ex.Message}" });
            }
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

        // Add this class to the bottom of your controller file
        public class UpdateBoardNameRequest
        {
            public int BoardId { get; set; }
            public string? BoardName { get; set; }
        }
    }
}

