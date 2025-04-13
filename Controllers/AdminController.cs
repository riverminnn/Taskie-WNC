using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Models.Requests;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    public class AdminController : Controller
    {
        private readonly UserRepository _userRepository;
        private readonly BoardRepository _boardRepository;
        private readonly ListRepository _listRepository;
        private readonly CardRepository _cardRepository;
        private readonly CommentRepository _commentRepository;
        private readonly BoardMemberRepository _boardMemberRepository;

        public AdminController(UserRepository userRepository, BoardRepository boardRepository, ListRepository listRepository, CardRepository cardRepository, CommentRepository commentRepository, BoardMemberRepository boardMemberRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _commentRepository = commentRepository;
            _boardMemberRepository = boardMemberRepository;
        }

        public IActionResult Home()
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString("Email")) || HttpContext.Session.GetString("Role") != "Admin")
            {
                return View("NotFound");
            }
            return View();
        }

        // User CRUD
        [HttpGet]
        public JsonResult GetUsers() => Json(_userRepository.GetAllUsers());

        [HttpPost]
        public IActionResult AddUser([FromBody] UserModel user)
        {
            if (_userRepository.EmailExists(user.Email))
            {
                return Json(new { success = false, message = "Email already exists." });
            }

            user.PasswordHash = AuthService.HashPassword(user.PasswordHash); // Hash the password
            _userRepository.Register(user);
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null) return Json(new { success = false, message = "User not found" });

            if (request.Field == "FullName") user.FullName = request.Value;
            if (request.Field == "Role") user.Role = request.Value;

            _userRepository.UpdateUser(user);
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult DeleteUser([FromBody] DeleteUserRequest request)
        {
            _userRepository.DeleteUser(request.UserID);
            return Json(new { success = true });
        }

        // Board CRUD
        [HttpGet]
        public JsonResult GetBoards() => Json(_boardRepository.GetAllBoards());

        [HttpPost]
        public IActionResult AddBoard([FromBody] BoardModel board)
        {
            _boardRepository.AddBoard(board);
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult UpdateBoard([FromBody] BoardModel board)
        {
            var updatedBoard = _boardRepository.UpdateBoard(board);
            if (updatedBoard == null) return Json(new { success = false, message = "Board not found" });
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult DeleteBoard([FromBody] int boardId)
        {
            _boardRepository.DeleteBoard(boardId);
            return Json(new { success = true });
        }

        // List CRUD
        [HttpGet]
        public JsonResult GetLists() => Json(_listRepository.GetAllLists());

        [HttpPost]
        public IActionResult AddList([FromBody] ListModel list)
        {
            _listRepository.AddList(list);
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult UpdateList([FromBody] ListModel list)
        {
            var updatedList = _listRepository.UpdateList(list);
            if (updatedList == null) return Json(new { success = false, message = "List not found" });
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult DeleteList([FromBody] int listId)
        {
            _listRepository.DeleteList(listId);
            return Json(new { success = true });
        }

        // Card CRUD
        [HttpGet]
        public JsonResult GetCards() => Json(_cardRepository.GetAllCards());

        [HttpPost]
        public IActionResult AddCard([FromBody] CardModel card)
        {
            _cardRepository.AddCard(card);
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult UpdateCard([FromBody] CardModel card)
        {
            var updatedCard = _cardRepository.UpdateCard(card);
            if (updatedCard == null) return Json(new { success = false, message = "Card not found" });
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult DeleteCard([FromBody] int cardId)
        {
            _cardRepository.DeleteCard(cardId);
            return Json(new { success = true });
        }

        // Comment CRUD
        [HttpGet]
        public JsonResult GetComments() => Json(_commentRepository.GetAllComments());

        [HttpPost]
        public IActionResult AddComment([FromBody] CommentModel comment)
        {
            _commentRepository.CreateComment(comment);
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult UpdateComment([FromBody] CommentModel comment)
        {
            var updatedComment = _commentRepository.UpdateComment(comment);
            if (updatedComment == null) return Json(new { success = false, message = "Comment not found" });
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult DeleteComment([FromBody] int commentId)
        {
            _commentRepository.DeleteComment(commentId);
            return Json(new { success = true });
        }
    }
}