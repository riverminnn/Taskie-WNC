using TaskieWNC.Models;

public class BoardRepository
{
    private readonly MyDbContext _dbContext;

    public BoardRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public BoardModel? GetBoardById(int boardId)
    {
        return _dbContext.Boards.Find(boardId);
    }

    public List<BoardModel> GetAllBoards()
    {
        return _dbContext.Boards.ToList();
    }

    public BoardModel CreateBoard(BoardModel board)
    {
        _dbContext.Boards.Add(board);
        _dbContext.SaveChanges();
        return board;
    }

    public BoardModel? UpdateBoard(BoardModel board)
    {
        var existingBoard = _dbContext.Boards.Find(board.BoardID);
        if (existingBoard != null)
        {
            _dbContext.Entry(existingBoard).CurrentValues.SetValues(board);
            _dbContext.SaveChanges();
        }
        return existingBoard;
    }

    public bool DeleteBoard(int boardId)
    {
        var board = _dbContext.Boards.Find(boardId);
        if (board != null)
        {
            _dbContext.Boards.Remove(board);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<BoardModel> GetBoardsByUserId(int userId)
    {
        return _dbContext.Boards.Where(b => b.UserID == userId).ToList();
    }

    public List<BoardModel> GetBoards(int pageNumber, int pageSize)
    {
        return _dbContext.Boards
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
}