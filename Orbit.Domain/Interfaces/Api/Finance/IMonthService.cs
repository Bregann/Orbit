using Orbit.Domain.DTOs.Finance.Month.Request;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface IMonthService
    {
        Task AddNewMonth(AddNewMonthRequest request);
    }
}
