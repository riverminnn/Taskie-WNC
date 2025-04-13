using Microsoft.EntityFrameworkCore;
using TaskieWNC.Models;
using System.Collections.Generic;
using System.Linq;

public class BoardMemberRepository
{
    private readonly MyDbContext _dbContext;

    public BoardMemberRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public List<BoardMemberViewModel> GetBoardMembers(int boardId)
    {
        // Join BoardMembers with Users to get the user details
        var boardMembers = _dbContext.BoardMembers
            .Where(bm => bm.BoardID == boardId)
            .Join(
                _dbContext.Users,
                bm => bm.UserID,
                u => u.UserID,
                (bm, u) => new BoardMemberViewModel
                {
                    MemberID = bm.MemberID,
                    BoardID = bm.BoardID,
                    UserID = bm.UserID,
                    Role = bm.Role,
                    AddedAt = bm.AddedAt,
                    User = u
                }
            )
            .ToList();

        return boardMembers;
    }

    public bool IsBoardMember(int boardId, int userId)
    {
        return _dbContext.BoardMembers.Any(bm => bm.BoardID == boardId && bm.UserID == userId);
    }

    public BoardMemberModel AddBoardMember(BoardMemberModel member)
    {
        _dbContext.BoardMembers.Add(member);
        _dbContext.SaveChanges();
        return member;
    }

    public bool RemoveBoardMember(int boardId, int userId)
    {
        var member = _dbContext.BoardMembers
            .FirstOrDefault(bm => bm.BoardID == boardId && bm.UserID == userId);

        if (member != null)
        {
            _dbContext.BoardMembers.Remove(member);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public BoardMemberModel? UpdateMemberRole(int boardId, int userId, string role)
    {
        var member = _dbContext.BoardMembers
            .FirstOrDefault(bm => bm.BoardID == boardId && bm.UserID == userId);

        if (member != null)
        {
            member.Role = role;
            _dbContext.SaveChanges();
            return member;
        }
        return null;
    }
    public BoardMemberModel? GetBoardMembership(int boardId, int userId)
    {
        return _dbContext.BoardMembers
            .FirstOrDefault(bm => bm.BoardID == boardId && bm.UserID == userId);
    }
    public bool UpdateBoardMemberRole(int boardId, int userId, string role)
    {
        try
        {
            var membership = _dbContext.BoardMembers
                .FirstOrDefault(m => m.BoardID == boardId && m.UserID == userId);

            if (membership == null)
            {
                return false;
            }

            // Update the role
            membership.Role = role;
            _dbContext.SaveChanges();

            return true;
        }
        catch
        {
            return false;
        }
    }
    public List<BoardMemberWithDetails> GetAllBoardMembers()
    {
        // Join BoardMembers with Users and Boards to get all details
        var boardMembers = _dbContext.BoardMembers
            .Join(_dbContext.Users,
                bm => bm.UserID,
                u => u.UserID,
                (bm, u) => new { bm, u })
            .Join(_dbContext.Boards,
                combined => combined.bm.BoardID,
                b => b.BoardID,
                (combined, b) => new BoardMemberWithDetails
                {
                    MemberID = combined.bm.MemberID,
                    BoardID = combined.bm.BoardID,
                    UserID = combined.bm.UserID,
                    Role = combined.bm.Role,
                    AddedAt = combined.bm.AddedAt,
                    UserFullName = combined.u.FullName,
                    UserEmail = combined.u.Email,
                    BoardName = b.BoardName
                })
            .ToList();

        return boardMembers;
    }
}

// Add this model class at the bottom of the file
public class BoardMemberWithDetails
{
    public int MemberID { get; set; }
    public int BoardID { get; set; }
    public int UserID { get; set; }
    public string? Role { get; set; }
    public DateTime AddedAt { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string BoardName { get; set; } = string.Empty;
}

// Add this view model to represent the result of joining BoardMembers with Users
public class BoardMemberViewModel
{
    public int MemberID { get; set; }
    public int BoardID { get; set; }
    public int UserID { get; set; }
    public string? Role { get; set; }
    public DateTime AddedAt { get; set; }
    public UserModel? User { get; set; }
}