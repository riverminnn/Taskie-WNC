using Microsoft.AspNetCore.Mvc;

namespace TaskieWNC.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
