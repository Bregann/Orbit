using FinanceManager.Domain.DTOs.Auth.Requests;
using FinanceManager.Domain.DTOs.Auth.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Data;

namespace FinanceManager.Core.Controllers
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
            try
            {
                var loginData = await authService.LoginUser(request);

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
            catch (KeyNotFoundException ex)
            {
                Log.Warning(ex, "Error attempting to login user");
                return Unauthorized(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                Log.Warning(ex, "Error attempting to login user");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Unknown error attempting to login user");
                return BadRequest();
            }
        }

        [HttpPost]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                return Unauthorized("No refresh token provided");
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
            catch (Exception ex) when (ex is UnauthorizedAccessException || ex is KeyNotFoundException)
            {
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                return Unauthorized(ex.Message);
            }
        }
    }
}
