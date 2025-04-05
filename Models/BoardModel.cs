using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskieWNC.Models
{
    [Table("Boards")]
    public class BoardModel
    {
        [Key]
        public int BoardID { get; set; } // Primary Key

        [Required]
        public int UserID { get; set; } // Foreign Key

        [Required]
        [StringLength(255)]
        public string BoardName { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserID")]
        public UserModel? User { get; set; } // Navigation Property
    }
}
