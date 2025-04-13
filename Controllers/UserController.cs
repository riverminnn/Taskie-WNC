using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using TaskieWNC.Services;

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
            if (!(loginCheck is EmptyResult)) return loginCheck;
            return View();
        }

        // Show the user profile page
        [HttpGet]
        [Route("Profile")]
        public IActionResult UserProfile()
        {
            var loginCheck = RequireLogin();
            if (!(loginCheck is EmptyResult)) return loginCheck;
            return View();
        }

        // Get user profile data for the profile page
        [HttpGet]
        [Route("GetProfile")]
        public IActionResult GetProfile()
        {
            if (!TryGetUserId(out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found." });
            }

            return Json(new
            {
                success = true,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                createdAt = user.CreatedAt
            });
        }

        // Update user profile (currently just fullName)
        [HttpPost]
        [Route("UpdateProfile")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!TryGetUserId(out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return Json(new { success = false, message = "Full name cannot be empty." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found." });
            }

            // Update the user's fullName
            user.FullName = request.FullName;
            _userRepository.UpdateUser(user);

            return Json(new { success = true, message = "Profile updated successfully." });
        }

        // For backward compatibility, redirect to Board controller
        [HttpGet]
        [Route("{boardId}/{boardName}")]
        public IActionResult BoardDetail(int boardId, string boardName)
        {
            return RedirectToAction("Detail", "Board", new { boardId, boardName });
        }
        // Add this method to UserController.cs
        private bool IsPasswordValid(string password, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (password.Length < 8)
            {
                errorMessage = "Password must be at least 8 characters long.";
                return false;
            }

            if (!password.Any(char.IsUpper))
            {
                errorMessage = "Password must contain at least one uppercase letter.";
                return false;
            }

            if (!password.Any(char.IsLower))
            {
                errorMessage = "Password must contain at least one lowercase letter.";
                return false;
            }

            if (!password.Any(char.IsDigit))
            {
                errorMessage = "Password must contain at least one number.";
                return false;
            }

            if (!password.Any(c => !char.IsLetterOrDigit(c)))
            {
                errorMessage = "Password must contain at least one special character.";
                return false;
            }

            return true;
        }

        // Update the ChangePassword method
        [HttpPost]
        [Route("ChangePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!TryGetUserId(out int userId))
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            var user = _userRepository.GetUserById(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found." });
            }

            // Verify current password
            if (!AuthService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return Json(new { success = false, message = "Current password is incorrect." });
            }

            // Validate new password
            if (!IsPasswordValid(request.NewPassword, out string errorMessage))
            {
                return Json(new { success = false, message = errorMessage });
            }

            // Update to new password
            user.PasswordHash = AuthService.HashPassword(request.NewPassword);
            _userRepository.UpdateUser(user);

            return Json(new { success = true, message = "Password changed successfully." });
        }
    }

    // Request model classes
    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}