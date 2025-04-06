using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    public class UserController : Controller
    {
        private readonly UserRepository _userRepository;
        private readonly BoardRepository _boardRepository;
        private readonly ListRepository _ListRepository;

        public UserController(UserRepository userRepository, BoardRepository boardRepository, ListRepository listRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
            _ListRepository = listRepository;
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
        public IActionResult BoardDetail(int boardId)
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString("Email")))
            {
                return View("NotFound");
            }

            // Fetch board details for the given board ID
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
            var lists = _ListRepository.GetListsByBoardId(boardID);
            return Json(new { success = true, lists });
        }
        [HttpPost]
        public IActionResult AddList([FromBody] ListModel newList)
        {
            if (newList == null || string.IsNullOrEmpty(newList.ListName))
            {
                return Json(new { success = false, message = "List name is required." });
            }

            // Add the new list to the database
            _ListRepository.AddList(newList);

            // Return success response
            return Json(new { success = true, message = "List added successfully!", list = newList });
        }
    }
}

