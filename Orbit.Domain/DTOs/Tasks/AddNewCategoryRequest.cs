using System;
using System.Collections.Generic;
using System.Text;

namespace Orbit.Domain.DTOs.Tasks
{
    public class AddNewCategoryRequest
    {
        public required string Name { get; set; }
    }
}
