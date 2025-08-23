using FinanceManager.Domain.DTOs.Auth.Requests;
using FinanceManager.Domain.DTOs.Auth.Responses;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface IAuthService
    {
        Task RegisterUser(RegisterUserRequest request);
        Task<LoginUserResponse> LoginUser(LoginUserRequest request);
        Task<LoginUserResponse> RefreshToken(string refreshToken);
    }
}
