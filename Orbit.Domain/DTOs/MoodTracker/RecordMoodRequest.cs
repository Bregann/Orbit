using Orbit.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Orbit.Domain.DTOs.MoodTracker
{
    public class RecordMoodRequest
    {
        public required MoodTrackerEnum Mood { get; set; }
    }
}
