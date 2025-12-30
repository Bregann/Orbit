using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Interfaces.Api.Fitbit;
using Serilog;
using System.Security.Claims;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class FitbitController(IFitbitService fitbitService) : ControllerBase
    {
        /// <summary>
        /// Generates the Fitbit OAuth authorization URL with PKCE
        /// </summary>
        [HttpGet]
        public ActionResult<FitbitAuthUrlResponse> GetAuthorizationUrl()
        {
            try
            {
                var (authUrl, codeVerifier) = fitbitService.GenerateAuthorizationUrl();

                // Store the code verifier in a cookie as backup
                Response.Cookies.Append("fitbit_code_verifier", codeVerifier, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(10)
                });

                // Also return it in the response so the client can store it
                return Ok(new FitbitAuthUrlResponse 
                { 
                    AuthorizationUrl = authUrl,
                    CodeVerifier = codeVerifier
                });
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error generating Fitbit authorization URL");
                return BadRequest("Failed to generate authorization URL");
            }
        }

        /// <summary>
        /// Exchanges the authorization code for access tokens
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> ExchangeCode([FromBody] FitbitCallbackRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                // Get the code verifier from cookie if not provided in request
                var codeVerifier = request.CodeVerifier;
                if (string.IsNullOrEmpty(codeVerifier))
                {
                    codeVerifier = Request.Cookies["fitbit_code_verifier"];
                }

                if (string.IsNullOrEmpty(codeVerifier))
                {
                    return BadRequest("Code verifier not found");
                }

                var tokens = await fitbitService.ExchangeCodeForTokensAsync(request.Code, codeVerifier);
                await fitbitService.SaveFitbitTokensAsync(userId, tokens);

                // Clear the code verifier cookie
                Response.Cookies.Delete("fitbit_code_verifier");

                return Ok();
            }
            catch (HttpRequestException ex)
            {
                Log.Error(ex, "Error exchanging Fitbit authorization code");
                return BadRequest("Failed to exchange authorization code");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Unknown error during Fitbit code exchange");
                return BadRequest("An error occurred");
            }
        }

        /// <summary>
        /// Gets the current Fitbit connection status
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<FitbitConnectionStatus>> GetConnectionStatus()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var status = await fitbitService.GetConnectionStatusAsync(userId);
                return Ok(status);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("User not found");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error getting Fitbit connection status");
                return BadRequest("Failed to get connection status");
            }
        }

        /// <summary>
        /// Disconnects Fitbit from the user's account
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> Disconnect()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                await fitbitService.DisconnectFitbitAsync(userId);
                return Ok();
            }
            catch (KeyNotFoundException)
            {
                return NotFound("User not found");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error disconnecting Fitbit");
                return BadRequest("Failed to disconnect Fitbit");
            }
        }

        /// <summary>
        /// Gets the user's Fitbit profile
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<FitbitProfileResponse>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var profile = await fitbitService.GetProfileAsync(userId);

                if (profile == null)
                {
                    return NotFound("Failed to get Fitbit profile");
                }

                return Ok(profile);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error getting Fitbit profile");
                return BadRequest("Failed to get profile");
            }
        }

        /// <summary>
        /// Gets the user's daily activity summary
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<FitbitActivityResponse>> GetDailyActivity([FromQuery] DateTime? date)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var targetDate = date ?? DateTime.Today;
                var activity = await fitbitService.GetDailyActivityAsync(userId, targetDate);

                if (activity == null)
                {
                    return NotFound("Failed to get activity data");
                }

                return Ok(activity);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error getting Fitbit daily activity");
                return BadRequest("Failed to get activity data");
            }
        }
    }
}
