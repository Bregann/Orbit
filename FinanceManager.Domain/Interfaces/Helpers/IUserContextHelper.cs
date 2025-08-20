using FinanceManager.Domain.Database.Models;

namespace FinanceManager.Domain.Interfaces.Helpers
{
    public interface IUserContextHelper
    {
        string GetUserId();
        string GetUserFirstName();
        User GetUser();
    }
}
