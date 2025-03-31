using TaskieWNC.Models;

public class TaskRepository
{
    private readonly MyDbContext _dbContext;

    public TaskRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public TaskModel? GetTaskById(int taskId)
    {
        return _dbContext.Tasks.Find(taskId);
    }

    public List<TaskModel> GetAllTasks()
    {
        return _dbContext.Tasks.ToList();
    }

    public TaskModel CreateTask(TaskModel task)
    {
        _dbContext.Tasks.Add(task);
        _dbContext.SaveChanges();
        return task;
    }

    public TaskModel? UpdateTask(TaskModel task)
    {
        var existingTask = _dbContext.Tasks.Find(task.TaskID);
        if (existingTask != null)
        {
            _dbContext.Entry(existingTask).CurrentValues.SetValues(task);
            _dbContext.SaveChanges();
        }
        return existingTask;
    }

    public bool DeleteTask(int taskId)
    {
        var task = _dbContext.Tasks.Find(taskId);
        if (task != null)
        {
            _dbContext.Tasks.Remove(task);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<TaskModel> GetTasksByListId(int listId)
    {
        return _dbContext.Tasks.Where(t => t.ListID == listId).ToList();
    }

    public List<TaskModel> GetTasks(int pageNumber, int pageSize)
    {
        return _dbContext.Tasks
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
}