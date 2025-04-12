using Microsoft.AspNetCore.Mvc;
using TaskieWNC.Models;
using System.Globalization;

namespace TaskieWNC.Controllers
{
    [Route("Card")]
    public class CardController : BaseController
    {
        private readonly CardRepository _cardRepository;

        public CardController(
            UserRepository userRepository,
            CardRepository cardRepository) : base(userRepository)
        {
            _cardRepository = cardRepository;
        }

        [HttpPost]
        [Route("Add")]
        public IActionResult Add([FromBody] CardModel newCard)
        {
            if (newCard == null || string.IsNullOrEmpty(newCard.CardName))
            {
                return Json(new { success = false, message = "Card name is required." });
            }

            // Add the new card to the database
            _cardRepository.AddCard(newCard);

            return Json(new { success = true, message = "Card added successfully!", card = newCard });
        }

        [HttpPost]
        [Route("UpdateStatus")]
        public IActionResult UpdateStatus([FromBody] UpdateCardStatusRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return Json(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                // Update card status
                card.Status = request.Status ?? "To Do";
                _cardRepository.UpdateCard(card);

                return Json(new { success = true, message = "Card status updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating card status: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("GetDetails")]
        public IActionResult GetDetails([FromBody] GetCardDetailsRequest request)
        {
            if (request == null || request.CardID <= 0)
            {
                return Json(new { success = false, message = "Invalid card ID." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                return Json(new { success = true, card });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error fetching card details: {ex.Message}" });
            }
        }

        [HttpPost]
        [Route("Update")]
        public IActionResult Update([FromBody] UpdateCardRequest request)
        {
            if (request == null || request.CardID <= 0 || string.IsNullOrEmpty(request.CardName))
            {
                return Json(new { success = false, message = "Invalid card data." });
            }

            try
            {
                var card = _cardRepository.GetCardById(request.CardID);
                if (card == null)
                {
                    return Json(new { success = false, message = "Card not found." });
                }

                // Update card properties
                card.CardName = request.CardName;
                card.Description = request.Description ?? string.Empty;
                card.Status = request.Status ?? "To Do";

                if (!string.IsNullOrEmpty(request.DueDate))
                {
                    card.DueDate = DateTime.Parse(request.DueDate, CultureInfo.InvariantCulture);
                }
                else
                {
                    card.DueDate = null;
                }

                // Save updates
                _cardRepository.UpdateCard(card);

                return Json(new { success = true, message = "Card updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error updating card: {ex.Message}" });
            }
        }

        // Model classes
        public class GetCardDetailsRequest
        {
            public int CardID { get; set; }
        }

        public class UpdateCardRequest
        {
            public int CardID { get; set; }
            public string? CardName { get; set; }
            public string? Description { get; set; }
            public string? DueDate { get; set; }
            public string? Status { get; set; }
        }

        public class UpdateCardStatusRequest
        {
            public int CardID { get; set; }
            public string? Status { get; set; }
        }
    }
}