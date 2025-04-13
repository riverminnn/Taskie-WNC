namespace TaskieWNC.Models.Requests
{
    public class UpdateUserRequest
    {
        public int UserID { get; set; } // The ID of the user to update
        public string Field { get; set; } = string.Empty; // The field to update (e.g., "FullName", "Role")
        public string Value { get; set; } = string.Empty; // The new value for the field
    }

    public class DeleteUserRequest
    {
        public int UserID { get; set; } // The ID of the user to delete
    }
}