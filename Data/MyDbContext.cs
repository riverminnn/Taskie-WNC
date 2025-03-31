
using Microsoft.EntityFrameworkCore;
using TaskieWNC.Models;

public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    public DbSet<UserModel> Users { get; set; }
    public DbSet<BoardModel> Boards { get; set; }
    public DbSet<CommentModel> Comments { get; set; }
    public DbSet<ListModel> Lists { get; set; }
    public DbSet<TaskModel> Tasks { get; set; }
}