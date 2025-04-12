using Microsoft.AspNetCore.Mvc;

namespace TaskieWNC.Controllers
{
    [Route("User")]
    public class UserController : BaseController
    {
        public UserController(UserRepository userRepository) : base(userRepository)
        {
        }

        [HttpGet]
        [Route("Home")]
        public IActionResult Home()
        {
            var loginCheck = RequireLogin();
            if (loginCheck != null) return loginCheck;

            return View();
        }

        // For backward compatibility, redirect to Board controller
        [HttpGet]
        [Route("{boardId}/{boardName}")]
        public IActionResult BoardDetail(int boardId, string boardName)
        {
            return RedirectToAction("Detail", "Board", new { boardId, boardName });
        }
    }
}