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
        // Explicitly map CommentModel to the "Comment" table
        modelBuilder.Entity<CommentModel>().ToTable("Comments");

        // Configure the foreign key relationships for CommentModel
        modelBuilder.Entity<CommentModel>()
            .HasOne(c => c.Card)
            .WithMany() // No navigation property in CardModel for comments
            .HasForeignKey(c => c.CardID)
            .OnDelete(DeleteBehavior.Restrict); // Disable cascade delete for Card

        modelBuilder.Entity<CommentModel>()
            .HasOne(c => c.User)
            .WithMany() // No navigation property in UserModel for comments
            .HasForeignKey(c => c.UserID)
            .OnDelete(DeleteBehavior.Restrict); // Disable cascade delete for User

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

        // Configure BoardMember -> User relationship with NO ACTION on delete
        modelBuilder.Entity<BoardMemberModel>()
            .HasOne<UserModel>()
            .WithMany()
            .HasForeignKey(bm => bm.UserID)
            .OnDelete(DeleteBehavior.NoAction);
    }
}