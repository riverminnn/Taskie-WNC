using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Services;

namespace TaskieWNC.Controllers
{
    public class HomeController : Controller
    {
        private readonly UserRepository _userRepository;

        public HomeController(UserRepository memberRepository)
        {
            _userRepository = memberRepository;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(string fullname, string email, string password, string confirmPassword)
        {
            // Validate passwords match
            if (password != confirmPassword)
            {
                return Json(new { success = false, message = "Passwords do not match." });
            }

            // Check if email already exists
            if (_userRepository.EmailExists(email))
            {
                return Json(new { success = false, message = "Email already exists." });
            }

            // Create new user
            var user = new UserModel
            {
                FullName = fullname,
                Email = email,
                PasswordHash = AuthService.HashPassword(password),
                Role = "User"
            };

            _userRepository.Register(user);

            // Return success response
            return Json(new { success = true, message = "Registration successful! Please log in." });
        }

        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                return Json(new { success = false, message = "Email and password are required." });
            }

            // Find user by email
            var user = _userRepository.GetUserByEmail(email);
            if (user == null)
            {
                return Json(new { success = false, message = "Invalid email or password." });
            }

            // Validate password
            if (!AuthService.VerifyPassword(password, user.PasswordHash))
            {
                return Json(new { success = false, message = "Invalid email or password." });
            }

            // Store user details in session
            HttpContext.Session.SetString("Email", user.Email);
            HttpContext.Session.SetString("UserID", user.UserID.ToString());
            HttpContext.Session.SetString("Role", user.Role);

            // Return success response
            return Json(new { success = true, message = "Login successful." });
        }

        [HttpPost]
        public IActionResult Logout()
        {
            // Clear the session
            HttpContext.Session.Clear();

            // Return a success response
            return Json(new { success = true, message = "Logout successful." });
        }

        public IActionResult Features()
        {
            return View("Features");
        }

        public IActionResult About()
        {
            return View("About");
        }

        public IActionResult Contact()
        {
            return View("Contact");
        }
    }
}

