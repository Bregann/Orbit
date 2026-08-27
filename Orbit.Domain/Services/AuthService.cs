using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Auth.Requests;
using Orbit.Domain.DTOs.Auth.Responses;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.Finance;
using Serilog;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services
{
    public class AuthService(AppDbContext context) : IAuthService
    {
        private readonly PasswordHasher<User> _passwordHasher = new();

        public async Task RegisterUser(RegisterUserRequest request)
        {
            Log.Information($"Registering user {request.Username}");

            var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (context.Users.Any(x => x.Username == request.Username || x.Email == request.Email))
            {
                Log.Information($"User already exists {request.Username}");
                throw new DuplicateNameException("User already exists");
            }

            var newUser = new User
            {
                Username = request.Username.ToLower().Trim(),
                FirstName = request.FirstName.Trim(),
                Email = request.Email.Trim(),
                PasswordHash = _passwordHasher.HashPassword(new User(), request.Password.Trim())
            };

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            Log.Information($"User registered {request.Username}");
        }

        public async Task<LoginUserResponse> LoginUser(LoginUserRequest request)
        {
            Log.Information($"Logging in user {request.Email}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim());

            if (user == null)
            {
                Log.Information($"User not found {request.Email}");
                throw new UnauthorizedException("User not found");
            }

            if (_passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            {
                Log.Information($"Invalid password for user {request.Email}");
                throw new UnauthorizedException("Invalid password");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            await SaveRefreshToken(refreshToken, user.Id);

            Log.Information($"User logged in {request.Email}");

            return new LoginUserResponse
            {
                AccessToken = token,
                RefreshToken = refreshToken
            };
        }

        public async Task<LoginUserResponse> RefreshToken(string userRefreshToken)
        {
            // Never log the raw token - it is a credential. A short fingerprint
            // is enough to correlate against the app-side auth debug log.
            var tokenFingerprint = Fingerprint(userRefreshToken);

            Log.Information("[Refresh] Attempting refresh for token {Fingerprint}", tokenFingerprint);
            var refreshToken = await context.UserRefreshTokens.FirstOrDefaultAsync(t => t.Token == userRefreshToken);

            if (refreshToken == null)
            {
                Log.Warning("[Refresh] REJECTED - token {Fingerprint} not found in database", tokenFingerprint);
                throw new UnauthorizedException("Token not found");
            }

            if (refreshToken.IsRevoked)
            {
                // This is the diagnostic that matters most: a revoked token means
                // it was already used by an earlier refresh. Log how many valid
                // tokens the user still has, which distinguishes a benign replay
                // (user has a working newer token) from a genuine lockout
                // (rotation left them with none).
                var validTokenCount = await context.UserRefreshTokens
                    .CountAsync(t => t.UserId == refreshToken.UserId
                                     && !t.IsRevoked
                                     && t.ExpiresAt > DateTime.UtcNow);

                Log.Warning(
                    "[Refresh] REJECTED - token {Fingerprint} already revoked for user {UserId}. " +
                    "User currently has {ValidTokenCount} valid token(s). " +
                    "If this is 0 the user is locked out and rotation lost their token.",
                    tokenFingerprint, refreshToken.UserId, validTokenCount);

                throw new UnauthorizedException("Refresh token has been revoked");
            }

            if (refreshToken.ExpiresAt < DateTime.UtcNow)
            {
                Log.Warning(
                    "[Refresh] REJECTED - token {Fingerprint} expired at {ExpiresAt} for user {UserId}",
                    tokenFingerprint, refreshToken.ExpiresAt, refreshToken.UserId);
                throw new UnauthorizedException("Refresh token expired");
            }

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == refreshToken.UserId);

            if (user == null)
            {
                Log.Information($"User not found for token {refreshToken.UserId}");
                throw new UnauthorizedException("User not found");
            }

            var token = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            // Revoking the old token and issuing the new one MUST be atomic.
            // Previously these were two separate SaveChangesAsync calls: if the
            // second failed (connection drop, restart mid-deploy), the old token
            // was left permanently revoked with no replacement ever persisted,
            // and the client - which never received a response - was locked out
            // holding a dead token until it logged in again.
            await using var transaction = await context.Database.BeginTransactionAsync();

            refreshToken.IsRevoked = true;

            context.UserRefreshTokens.Add(new UserRefreshToken
            {
                Token = newRefreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            });

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            Log.Information(
                "[Refresh] SUCCESS - user {UserId} rotated {OldFingerprint} -> {NewFingerprint}",
                refreshToken.UserId, tokenFingerprint, Fingerprint(newRefreshToken));

            return new LoginUserResponse
            {
                AccessToken = token,
                RefreshToken = newRefreshToken
            };
        }

        private static string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JwtKey")!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: Environment.GetEnvironmentVariable("JwtValidIssuer"),
                audience: Environment.GetEnvironmentVariable("JwtValidAudience"),
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(128));
        }

        /// <summary>
        /// Short, non-reversible-enough identifier for correlating a token across
        /// the API log and the app's auth debug log, without ever writing the
        /// credential itself to disk. Matches the app-side `fingerprint` format.
        /// </summary>
        private static string Fingerprint(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return "none";
            }

            return token.Length <= 10
                ? $"(len {token.Length})"
                : $"{token[..6]}…{token[^4..]} (len {token.Length})";
        }

        private async Task SaveRefreshToken(string token, string userId)
        {
            var refreshToken = new UserRefreshToken
            {
                Token = token,
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            };

            context.UserRefreshTokens.Add(refreshToken);
            await context.SaveChangesAsync();
        }
    }
}
