using Microsoft.EntityFrameworkCore;
using TaskieWNC.Models;

public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    public DbSet<UserModel> Users { get; set; }
    public DbSet<BoardModel> Boards { get; set; }
    public DbSet<CommentModel> Comments { get; set; }
    public DbSet<ListModel> Lists { get; set; }
    public DbSet<CardModel> Cards { get; set; }
    public DbSet<BoardMemberModel> BoardMembers { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Card -> List relationship
        modelBuilder.Entity<CardModel>()
            .HasOne(c => c.List)
            .WithMany()
            .HasForeignKey(c => c.ListID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure List -> Board relationship
        modelBuilder.Entity<ListModel>()
            .HasOne(l => l.Board)
            .WithMany()
            .HasForeignKey(l => l.BoardID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Comment -> Card relationship
        modelBuilder.Entity<CommentModel>()
            .HasOne(c => c.Card)
            .WithMany()
            .HasForeignKey(c => c.CardID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Comment -> User relationship 
        modelBuilder.Entity<CommentModel>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserID)
            .OnDelete(DeleteBehavior.NoAction); // Changed to NoAction

        // Configure Board -> User relationship
        modelBuilder.Entity<BoardModel>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure BoardMember -> Board relationship
        modelBuilder.Entity<BoardMemberModel>()
            .HasOne<BoardModel>()
            .WithMany()
            .HasForeignKey(bm => bm.BoardID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure BoardMember -> User relationship
        modelBuilder.Entity<BoardMemberModel>()
            .HasOne<UserModel>()
            .WithMany()
            .HasForeignKey(bm => bm.UserID)
            .OnDelete(DeleteBehavior.NoAction); // Changed from Cascade to NoAction
    }
}