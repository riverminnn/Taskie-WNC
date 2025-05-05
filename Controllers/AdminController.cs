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
        public IActionResult AddUser([FromBody] AddUserRequest request)
        {
            if (_userRepository.EmailExists(request.Email))
            {
                return Json(new { success = false, message = "Email already exists." });
            }

            var user = new UserModel
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = AuthService.HashPassword(request.Password),
                Role = request.Role,
                VerifyKey = request.VerifyKey
            };

            _userRepository.Register(user);
            return Json(new { success = true, message = "User added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null) return Json(new { success = false, message = "User not found." });

            if (request.Field == "FullName") user.FullName = request.Value;
            if (request.Field == "Role") user.Role = request.Value;

            _userRepository.UpdateUser(user);
            return Json(new { success = true, message = "User updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteUser([FromBody] DeleteUserRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null) return Json(new { success = false, message = "User not found." });

            _userRepository.DeleteUser(request.UserID);
            return Json(new { success = true, message = "User deleted successfully." });
        }

        // Board CRUD
        [HttpGet]
        public JsonResult GetBoards() => Json(_boardRepository.GetAllBoards());

        [HttpPost]
        public IActionResult AddBoard([FromBody] AddBoardRequest request)
        {
            var user = _userRepository.GetUserById(request.UserID);
            if (user == null)
            {
                return Json(new { success = false, message = "UserID does not exist." });
            }

            var board = new BoardModel
            {
                BoardName = request.BoardName,
                UserID = request.UserID
            };

            _boardRepository.AddBoard(board);
            return Json(new { success = true, message = "Board added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateBoard([FromBody] UpdateBoardRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null) return Json(new { success = false, message = "Board not found." });

            board.BoardName = request.BoardName;
            _boardRepository.UpdateBoard(board);
            return Json(new { success = true, message = "Board updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteBoard([FromBody] DeleteBoardRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null) return Json(new { success = false, message = "Board not found." });

            _boardRepository.DeleteBoard(request.BoardID);
            return Json(new { success = true, message = "Board deleted successfully." });
        }

        // List CRUD
        [HttpGet]
        public JsonResult GetLists() => Json(_listRepository.GetAllLists());

        [HttpPost]
        public IActionResult AddList([FromBody] AddListRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null)
            {
                return Json(new { success = false, message = "BoardID does not exist." });
            }

            var list = new ListModel
            {
                ListName = request.ListName,
                BoardID = request.BoardID
            };

            _listRepository.AddList(list);
            return Json(new { success = true, message = "List added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateList([FromBody] UpdateListRequest request)
        {
            var list = _listRepository.GetListById(request.ListID);
            if (list == null) return Json(new { success = false, message = "List not found." });

            list.ListName = request.ListName;
            _listRepository.UpdateList(list);
            return Json(new { success = true, message = "List updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteList([FromBody] DeleteListRequest request)
        {
            var list = _listRepository.GetListById(request.ListID);
            if (list == null) return Json(new { success = false, message = "List not found." });

            _listRepository.DeleteList(request.ListID);
            return Json(new { success = true, message = "List deleted successfully." });
        }

        // Card CRUD
        [HttpGet]
        public JsonResult GetCards() => Json(_cardRepository.GetAllCards());

        [HttpPost]
        public IActionResult AddCard([FromBody] AddCardRequest request)
        {
            var list = _listRepository.GetListById(request.ListID);
            if (list == null)
            {
                return Json(new { success = false, message = "ListID does not exist." });
            }

            var card = new CardModel
            {
                CardName = request.CardName,
                ListID = request.ListID,
                Status = request.Status
            };

            _cardRepository.AddCard(card);
            return Json(new { success = true, message = "Card added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateCard([FromBody] UpdateCardRequest request)
        {
            var card = _cardRepository.GetCardById(request.CardID);
            if (card == null) return Json(new { success = false, message = "Card not found." });

            if (request.Field == "CardName") card.CardName = request.Value;
            if (request.Field == "Status") card.Status = request.Value;

            _cardRepository.UpdateCard(card);
            return Json(new { success = true, message = "Card updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteCard([FromBody] DeleteCardRequest request)
        {
            var card = _cardRepository.GetCardById(request.CardID);
            if (card == null) return Json(new { success = false, message = "Card not found." });

            _cardRepository.DeleteCard(request.CardID);
            return Json(new { success = true, message = "Card deleted successfully." });
        }

        // Comment CRUD
        [HttpGet]
        public JsonResult GetComments() => Json(_commentRepository.GetAllComments());

        [HttpPost]
        public IActionResult AddComment([FromBody] AddCommentRequest request)
        {
            var card = _cardRepository.GetCardById(request.CardID);
            if (card == null)
            {
                return Json(new { success = false, message = "CardID does not exist." });
            }

            var user = _userRepository.GetUserById(request.UserID);
            if (user == null)
            {
                return Json(new { success = false, message = "UserID does not exist." });
            }

            var comment = new CommentModel
            {
                CardID = request.CardID,
                UserID = request.UserID,
                Content = request.Content
            };

            _commentRepository.CreateComment(comment);
            return Json(new { success = true, message = "Comment added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateComment([FromBody] UpdateCommentRequest request)
        {
            var comment = _commentRepository.GetCommentById(request.CommentID);
            if (comment == null) return Json(new { success = false, message = "Comment not found." });

            comment.Content = request.Content;
            _commentRepository.UpdateComment(comment);
            return Json(new { success = true, message = "Comment updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteComment([FromBody] DeleteCommentRequest request)
        {
            var comment = _commentRepository.GetCommentById(request.CommentID);
            if (comment == null) return Json(new { success = false, message = "Comment not found." });

            _commentRepository.DeleteComment(request.CommentID);
            return Json(new { success = true, message = "Comment deleted successfully." });
        }
        // Add these methods to the AdminController class
        [HttpGet]
        public JsonResult GetBoardMembers(int boardId)
        {
            var boardMembers = _boardMemberRepository.GetBoardMembers(boardId);
            return Json(boardMembers);
        }

        [HttpGet]
        public JsonResult GetAllBoardMembers()
        {
            var allBoardMembers = _boardMemberRepository.GetAllBoardMembers();
            return Json(allBoardMembers);
        }

        [HttpPost]
        public IActionResult AddBoardMember([FromBody] AddBoardMemberRequest request)
        {
            var board = _boardRepository.GetBoardById(request.BoardID);
            if (board == null)
            {
                return Json(new { success = false, message = "Board not found." });
            }

            var user = _userRepository.GetUserById(request.UserID);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found." });
            }

            // Check if user is already a member of this board
            if (_boardMemberRepository.IsBoardMember(request.BoardID, request.UserID))
            {
                return Json(new { success = false, message = "User is already a member of this board." });
            }

            var boardMember = new BoardMemberModel
            {
                BoardID = request.BoardID,
                UserID = request.UserID,
                Role = request.Role
            };

            _boardMemberRepository.AddBoardMember(boardMember);
            return Json(new { success = true, message = "Board member added successfully." });
        }

        [HttpPost]
        public IActionResult UpdateBoardMemberRole([FromBody] UpdateBoardMemberRoleRequest request)
        {
            var success = _boardMemberRepository.UpdateBoardMemberRole(request.BoardID, request.UserID, request.Role);
            if (!success)
            {
                return Json(new { success = false, message = "Failed to update board member role." });
            }

            return Json(new { success = true, message = "Board member role updated successfully." });
        }

        [HttpPost]
        public IActionResult DeleteBoardMember([FromBody] DeleteBoardMemberRequest request)
        {
            var success = _boardMemberRepository.RemoveBoardMember(request.BoardID, request.UserID);
            if (!success)
            {
                return Json(new { success = false, message = "Failed to delete board member." });
            }

            return Json(new { success = true, message = "Board member deleted successfully." });
        }
    }
}