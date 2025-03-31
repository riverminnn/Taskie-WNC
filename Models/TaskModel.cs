using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskieWNC.Models
{
    [Table("Task")]
    public class TaskModel
    {
        [Key]
        public int TaskID { get; set; } // Primary Key

        [Required]
        public int ListID { get; set; } // Foreign Key

        [Required]
        [StringLength(255)]
        public string TaskName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "To Do"; // Default value

        [Required]
        public int Position { get; set; } = 0;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("ListID")]
        public ListModel? List { get; set; }// Navigation Property
    }
}