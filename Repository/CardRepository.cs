using TaskieWNC.Models;

public class CardRepository
{
    private readonly MyDbContext _dbContext;

    public CardRepository(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public CardModel? GetCardById(int cardId)
    {
        return _dbContext.Cards.Find(cardId);
    }

    public List<CardModel> GetAllCards()
    {
        return _dbContext.Cards.ToList();
    }

    public CardModel AddCard(CardModel card)
    {
        _dbContext.Cards.Add(card);
        _dbContext.SaveChanges();
        return card;
    }

    public CardModel? UpdateCard(CardModel card)
    {
        var existingCard = _dbContext.Cards.Find(card.CardID);
        if (existingCard != null)
        {
            _dbContext.Entry(existingCard).CurrentValues.SetValues(card);
            _dbContext.SaveChanges();
        }
        return existingCard;
    }

    public bool DeleteCard(int cardId)
    {
        var card = _dbContext.Cards.Find(cardId);
        if (card != null)
        {
            _dbContext.Cards.Remove(card);
            _dbContext.SaveChanges();
            return true;
        }
        return false;
    }

    public List<CardModel> GetCardsByListId(int listId)
    {
        return _dbContext.Cards.Where(c => c.ListID == listId).OrderBy(c => c.Position).ToList();
    }
}