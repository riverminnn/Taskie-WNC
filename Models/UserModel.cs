using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskieWNC.Models
{
    [Table("Users")]
    public class UserModel
    {
        [Key]
        public int UserID { get; set; } // Primary Key

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty; // Added Email with validation

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "User";

        [StringLength(10, MinimumLength = 10, ErrorMessage = "Verify key must be exactly 10 characters.")]
        [RegularExpression(@"^[0-9][a-zA-Z0-9]{9}$", ErrorMessage = "Must start with a number.")]
        public string? VerifyKey { get; set; }
    }
}