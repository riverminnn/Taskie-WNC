using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskieWNC.Models
{
    [Table("Comments")]
    public class CommentModel
    {
        [Key]
        public int CommentID { get; set; } // Primary Key

        [Required]
        public int CardID { get; set; } // Foreign Key

        [Required]
        public int UserID { get; set; } // Foreign Key

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("CardID")]
        public CardModel? Card { get; set; } // Navigation Property

        [ForeignKey("UserID")]
        public UserModel? User { get; set; } // Navigation Property
    }
}