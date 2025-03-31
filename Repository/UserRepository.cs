using TaskieWNC.Models;

public class UserRepository
{
    private readonly MyDbContext _dbContext;

    public UserRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public UserModel? GetUserByEmail(string email)
    {
        return _dbContext.Users.FirstOrDefault(u => u.Email == email);
    }

    public bool EmailExists(string email)
    {
        return _dbContext.Users.Any(u => u.Email == email);
    }

    public UserModel Register(UserModel user)
    {
        _dbContext.Users.Add(user);
        _dbContext.SaveChanges();
        return user;
    }

    public List<UserModel> GetAllUser()
    {
        return _dbContext.Users.ToList();
    }

    public UserModel? GetUserById(int userId)
    {
        return _dbContext.Users.Find(userId);
    }

    public UserModel? UpdateUser(UserModel user)
    {
        var existingUser = _dbContext.Users.Find(user.UserID);
        if (existingUser != null)
        {
            _dbContext.Entry(existingUser).CurrentValues.SetValues(user);
            _dbContext.SaveChanges();
        }
        return existingUser; // Return null if user not found
    }

    public bool DeleteUser(int userId)
    {
        var user = _dbContext.Users.Find(userId);
        if (user != null)
        {
            _dbContext.Users.Remove(user);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<UserModel> GetUsers(int pageNumber, int pageSize)
    {
        return _dbContext.Users
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    public List<UserModel> SearchUsers(string searchTerm)
    {
        return _dbContext.Users
            .Where(u => u.FullName.Contains(searchTerm) || u.Email.Contains(searchTerm))
            .ToList();
    }
}