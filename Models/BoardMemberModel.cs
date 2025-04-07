using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TaskieWNC.Models
{
    [Table("BoardMembers")]
    public class BoardMemberModel
    {
        [Key]
        public int MemberID { get; set; }

        [Required]
        public int BoardID { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "Editor"; // Options: "Owner", "Editor", "Viewer"

        [Required]
        public DateTime AddedAt { get; set; } = DateTime.Now;

        // Don't set up navigation properties here
    }
}