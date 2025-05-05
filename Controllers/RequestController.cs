namespace TaskieWNC.Models.Requests
{
    // User Requests
    public class AddUserRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public string? VerifyKey { get; set; }
    }

    public class UpdateUserRequest
    {
        public int UserID { get; set; }
        public string Field { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class DeleteUserRequest
    {
        public int UserID { get; set; }
    }

    // Board Requests
    public class AddBoardRequest
    {
        public string BoardName { get; set; } = string.Empty;
        public int UserID { get; set; }
    }

    public class UpdateBoardRequest
    {
        public int BoardID { get; set; }
        public string BoardName { get; set; } = string.Empty;
    }

    public class DeleteBoardRequest
    {
        public int BoardID { get; set; }
    }

    // List Requests
    public class AddListRequest
    {
        public string ListName { get; set; } = string.Empty;
        public int BoardID { get; set; }
    }

    public class UpdateListRequest
    {
        public int ListID { get; set; }
        public string ListName { get; set; } = string.Empty;
    }

    public class DeleteListRequest
    {
        public int ListID { get; set; }
    }

    // Card Requests
    public class AddCardRequest
    {
        public string CardName { get; set; } = string.Empty;
        public int ListID { get; set; }
        public string Status { get; set; } = "To Do";
    }

    public class UpdateCardRequest
    {
        public int CardID { get; set; }
        public string Field { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class DeleteCardRequest
    {
        public int CardID { get; set; }
    }

    // Comment Requests
    public class AddCommentRequest
    {
        public int CardID { get; set; }
        public int UserID { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class UpdateCommentRequest
    {
        public int CommentID { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class DeleteCommentRequest
    {
        public int CommentID { get; set; }
    }
    public class AddBoardMemberRequest
    {
        public int BoardID { get; set; }
        public int UserID { get; set; }
        public string Role { get; set; } = "Viewer";
    }

    public class UpdateBoardMemberRoleRequest
    {
        public int BoardID { get; set; }
        public int UserID { get; set; }
        public string Role { get; set; } = "Viewer";
    }

    public class DeleteBoardMemberRequest
    {
        public int BoardID { get; set; }
        public int UserID { get; set; }
    }
}