using Orbit.Domain.DTOs.Auth.Requests;
using Orbit.Domain.DTOs.Auth.Responses;

namespace Orbit.Domain.Interfaces.Api
{
    public interface IAuthService
    {
        Task RegisterUser(RegisterUserRequest request);
        Task<LoginUserResponse> LoginUser(LoginUserRequest request);
        Task<LoginUserResponse> RefreshToken(string refreshToken);
    }
}
