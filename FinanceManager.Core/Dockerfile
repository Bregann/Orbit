# See https://aka.ms/customizecontainer to learn how to customize your debug container 
# and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files
COPY ["FinanceManager.Core/FinanceManager.Core.csproj", "FinanceManager.Core/"]
COPY ["FinanceManager.Domain/FinanceManager.Domain.csproj", "FinanceManager.Domain/"]

# Restore dependencies
RUN dotnet restore "FinanceManager.Core/FinanceManager.Core.csproj"

# Copy all source
COPY . .

# Build the project
WORKDIR "/src/FinanceManager.Core"
RUN dotnet build "FinanceManager.Core.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR "/src/FinanceManager.Core"
RUN dotnet publish "FinanceManager.Core.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinanceManager.Core.dll"]
