using Microsoft.AspNetCore.SignalR;

namespace TaskieWNC.Hubs
{
    public class CardHub : Hub
    {
        public async Task JoinBoard(string boardId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        }

        public async Task LeaveBoard(string boardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId);
        }

        public async Task NotifyCardAdded(string boardId, object cardData)
        {
            await Clients.Group(boardId).SendAsync("CardAdded", cardData);
        }
    }
}