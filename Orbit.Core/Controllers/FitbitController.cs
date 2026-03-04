using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.Fitbit;
using Orbit.Domain.Interfaces.Helpers;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class FitbitController(IFitbitService fitbitService, IUserContextHelper userContextHelper) : ControllerBase
    {
        /// <summary>
        /// Generates the Fitbit OAuth authorization URL with PKCE
        /// </summary>
        [HttpGet]
        public ActionResult<FitbitAuthUrlResponse> GetAuthorizationUrl()
        {
            var (authUrl, codeVerifier) = fitbitService.GenerateAuthorizationUrl();

            Response.Cookies.Append("fitbit_code_verifier", codeVerifier, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(10)
            });

            return Ok(new FitbitAuthUrlResponse
            {
                AuthorizationUrl = authUrl,
                CodeVerifier = codeVerifier
            });
        }

        /// <summary>
        /// Exchanges the authorization code for access tokens
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> ExchangeCode([FromBody] FitbitCallbackRequest request)
        {
            var userId = userContextHelper.GetUserId();

            var codeVerifier = request.CodeVerifier;

            if (string.IsNullOrEmpty(codeVerifier))
            {
                codeVerifier = Request.Cookies["fitbit_code_verifier"];
            }

            if (string.IsNullOrEmpty(codeVerifier))
            {
                throw new BadRequestException("Code verifier not found");
            }

            var tokens = await fitbitService.ExchangeCodeForTokens(request.Code, codeVerifier);
            await fitbitService.SaveFitbitTokens(userId, tokens);

            Response.Cookies.Delete("fitbit_code_verifier");

            return Ok();
        }

        /// <summary>
        /// Gets the current Fitbit connection status
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<FitbitConnectionStatus>> GetConnectionStatus()
        {
            var userId = userContextHelper.GetUserId();
            var status = await fitbitService.GetConnectionStatus(userId);
            return Ok(status);
        }

        /// <summary>
        /// Disconnects Fitbit from the user's account
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> Disconnect()
        {
            var userId = userContextHelper.GetUserId();
            await fitbitService.DisconnectFitbit(userId);
            return Ok();
        }

        /// <summary>
        /// Gets the user's Fitbit profile
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<FitbitProfileResponse>> GetProfile()
        {
            var userId = userContextHelper.GetUserId();
            var profile = await fitbitService.GetProfile(userId);

            if (profile == null)
            {
                throw new NotFoundException("Failed to get Fitbit profile");
            }

            return Ok(profile);
        }

        /// <summary>
        /// Gets the user's daily activity summary
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<FitbitActivityResponse>> GetDailyActivity([FromQuery] DateTime? date)
        {
            var userId = userContextHelper.GetUserId();
            var targetDate = date ?? DateTime.Today;
            var activity = await fitbitService.GetDailyActivity(userId, targetDate);

            if (activity == null)
            {
                throw new NotFoundException("Failed to get activity data");
            }

            return Ok(activity);
        }
    }
}
