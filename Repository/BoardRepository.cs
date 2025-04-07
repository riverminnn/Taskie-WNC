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

    public BoardModel AddBoard(BoardModel board)
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
    // Add to BoardRepository.cs
    public bool HasBoardAccess(int boardId, int userId)
    {
        // Check if user is either the board owner or a board member
        var board = _dbContext.Boards.Find(boardId);
        if (board != null && board.UserID == userId)
        {
            return true; // User is the owner
        }

        // Check if user is a board member
        return _dbContext.BoardMembers.Any(bm => bm.BoardID == boardId && bm.UserID == userId);
    }
    public List<BoardWithOwnerInfo> GetSharedBoardsByUserId(int userId)
    {
        // Find boards where the user is a member and include owner info
        return _dbContext.BoardMembers
            .Where(bm => bm.UserID == userId)
            .Join(_dbContext.Boards,
                bm => bm.BoardID,
                b => b.BoardID,
                (bm, b) => new { BoardMember = bm, Board = b })
            .Join(_dbContext.Users,
                joined => joined.Board.UserID,
                user => user.UserID,
                (joined, user) => new BoardWithOwnerInfo
                {
                    BoardID = joined.Board.BoardID,
                    BoardName = joined.Board.BoardName,
                    UserID = joined.Board.UserID,
                    CreatedAt = joined.Board.CreatedAt,
                    OwnerName = user.FullName,
                    OwnerEmail = user.Email
                })
            .ToList();
    }

    public class BoardWithOwnerInfo
    {
        public int BoardID { get; set; }
        public string BoardName { get; set; } = string.Empty; // Initialize with empty string
        public int UserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public string OwnerName { get; set; } = string.Empty; // Initialize with empty string
        public string OwnerEmail { get; set; } = string.Empty; // Initialize with empty string
    }
}
