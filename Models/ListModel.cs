using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskieWNC.Models
{
    [Table("Lists")]
    public class ListModel
    {
        [Key]
        public int ListID { get; set; } // Primary Key

        [Required]
        public int BoardID { get; set; } // Foreign Key

        [Required]
        [StringLength(255)]
        public string ListName { get; set; } = string.Empty;

        [Required]
        public int Position { get; set; }

        [ForeignKey("BoardID")]
        public BoardModel? Board { get; set; } // Navigation Property
    }
}