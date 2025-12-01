using Orbit.Domain.DTOs.Month.Request;

namespace Orbit.Domain.Interfaces.Api
{
    public interface IMonthService
    {
        Task AddNewMonth(AddNewMonthRequest request);
    }
}
