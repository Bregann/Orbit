using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Chores
{
    public class UpdateChoreRequest
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required ChoreFrequencyType Frequency { get; set; }
        public required DateTime NextDueDate { get; set; }
        public int? CustomFrequencyDays { get; set; }
    }
}
