using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;

namespace TaskieWNC.Controllers
{
    public abstract class BaseController : Controller
    {
        // Constants
        protected const string VIEW_NOT_FOUND = "NotFound";
        protected const string SESSION_USER_ID = "UserID";
        protected const string SESSION_EMAIL = "Email";

        protected readonly UserRepository _userRepository;

        public BaseController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // Common utility methods
        protected bool IsUserLoggedIn()
        {
            return !string.IsNullOrEmpty(HttpContext.Session.GetString(SESSION_EMAIL));
        }

        protected bool TryGetUserId(out int userId)
        {
            userId = 0;
            var userIdStr = HttpContext.Session.GetString(SESSION_USER_ID);
            return !string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out userId);
        }

        protected IActionResult RequireLogin()
        {
            if (!IsUserLoggedIn())
            {
                return View(VIEW_NOT_FOUND);
            }
            return null;
        }
    }
}