using TaskieWNC.Models;

public class CommentRepository
{
    private readonly MyDbContext _dbContext;

    public CommentRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public CommentModel? GetCommentById(int commentId)
    {
        return _dbContext.Comments.Find(commentId);
    }

    public List<CommentModel> GetAllComments()
    {
        return _dbContext.Comments.ToList();
    }

    public CommentModel CreateComment(CommentModel comment)
    {
        _dbContext.Comments.Add(comment);
        _dbContext.SaveChanges();
        return comment;
    }

    public CommentModel? UpdateComment(CommentModel comment)
    {
        var existingComment = _dbContext.Comments.Find(comment.CommentID);
        if (existingComment != null)
        {
            _dbContext.Entry(existingComment).CurrentValues.SetValues(comment);
            _dbContext.SaveChanges();
        }
        return existingComment;
    }

    public bool DeleteComment(int commentId)
    {
        var comment = _dbContext.Comments.Find(commentId);
        if (comment != null)
        {
            _dbContext.Comments.Remove(comment);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<CommentModel> GetCommentsByTaskId(int taskId)
    {
        return _dbContext.Comments.Where(c => c.TaskID == taskId).ToList();
    }

    public List<CommentModel> GetComments(int pageNumber, int pageSize)
    {
        return _dbContext.Comments
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
}