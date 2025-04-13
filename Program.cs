using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<BoardRepository>();
builder.Services.AddScoped<CommentRepository>();
builder.Services.AddScoped<ListRepository>();
builder.Services.AddScoped<CardRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<BoardMemberRepository>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddSession();
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure middleware
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve static files (e.g., CSS, JS, images)
app.UseRouting();
app.UseSession();
app.UseAuthorization();

// Configure routing
// Route for board details
app.MapControllerRoute(
    name: "boardDetail",
    pattern: "User/{boardId}/{boardName}",
    defaults: new { controller = "User", action = "BoardDetail" });

app.MapControllerRoute(
    name: "features",
    pattern: "feature",
    defaults: new { controller = "Home", action = "Features" });

app.MapControllerRoute(
    name: "about",
    pattern: "about",
    defaults: new { controller = "Home", action = "About" });

app.MapControllerRoute(
    name: "contact",
    pattern: "contact",
    defaults: new { controller = "Home", action = "Contact" });

// Default route
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();