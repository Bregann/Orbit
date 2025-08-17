using FinanceManager.Domain.DTOs.Stats.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface IStatsService
    {
        Task<GetHomepageStatsDto> GetHomepageStats();
    }
}
