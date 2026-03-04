using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Auth.Requests;
using Orbit.Domain.DTOs.Auth.Responses;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> RegisterUser([FromBody] RegisterUserRequest request)
        {
            //try
            //{
            //    await authService.RegisterUser(request);
            //}
            //catch (DuplicateNameException ex)
            //{
            //    Log.Warning(ex, "Error attempting to register user");
            //    return BadRequest(ex.Message);
            //}
            //catch (Exception ex)
            //{
            //    Log.Fatal(ex, "Unknown error attempting to register user");
            //    return BadRequest();
            //}

            //return Ok();
            return NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<LoginUserResponse>> LoginUser([FromBody] LoginUserRequest request)
        {
            var loginData = await authService.LoginUser(request);

            if (request.IsMobile)
            {
                return Ok(loginData);
            }

            Response.Cookies.Append("accessToken", loginData.AccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

            Response.Cookies.Append("refreshToken", loginData.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(30)
            });

            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                throw new UnauthorizedException("No refresh token provided");
            }

            try
            {
                var newAccessToken = await authService.RefreshToken(refreshToken);
                Response.Cookies.Append("accessToken", newAccessToken.AccessToken, new CookieOptions
                {
                    HttpOnly = false,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddHours(1)
                });
                return Ok();
            }
            catch (UnauthorizedException)
            {
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                throw;
            }
        }

        [HttpPost]
        public async Task<ActionResult<LoginUserResponse>> RefreshAppToken([FromBody] RefreshTokenRequest request)
        {
            var response = await authService.RefreshToken(request.RefreshToken);
            return Ok(response);
        }
    }
}
