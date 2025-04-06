using TaskieWNC.Models;

public class ListRepository
{
    private readonly MyDbContext _dbContext;

    public ListRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public ListModel? GetListById(int listId)
    {
        return _dbContext.Lists.Find(listId);
    }

    public List<ListModel> GetAllLists()
    {
        return _dbContext.Lists.ToList();
    }

    public ListModel AddList(ListModel list)
    {
        _dbContext.Lists.Add(list);
        _dbContext.SaveChanges();
        return list;
    }

    public ListModel? UpdateList(ListModel list)
    {
        var existingList = _dbContext.Lists.Find(list.ListID);
        if (existingList != null)
        {
            _dbContext.Entry(existingList).CurrentValues.SetValues(list);
            _dbContext.SaveChanges();
        }
        return existingList;
    }

    public bool DeleteList(int listId)
    {
        var list = _dbContext.Lists.Find(listId);
        if (list != null)
        {
            _dbContext.Lists.Remove(list);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<ListModel> GetListsByBoardId(int boardId)
    {
        return _dbContext.Lists.Where(l => l.BoardID == boardId).ToList();
    }

    public List<ListModel> GetLists(int pageNumber, int pageSize)
    {
        return _dbContext.Lists
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
}