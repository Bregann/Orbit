using Orbit.Domain.DTOs.Month.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Orbit.Domain.Interfaces.Api
{
    public interface IMonthService
    {
        Task AddNewMonth(AddNewMonthRequest request);
    }
}
