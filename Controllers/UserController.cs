using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    public class UserController : Controller
    {
        private readonly UserRepository _userRepository;

        public UserController(UserRepository memberRepository)
        {
            _userRepository = memberRepository;
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
    }
}

