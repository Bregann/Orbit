using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class TaskCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public required string Name { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ICollection<Task> Tasks { get; set; } = null!;
    }
}
