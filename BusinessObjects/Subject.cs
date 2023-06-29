using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObjects
{
    public class Subject
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Name { get; set; }

        public string? TeacherId { get; set; }

        [ForeignKey(nameof(TeacherId))]
        public User? User { get; set; }
       
        public ICollection<Grades> Grades { get; set; }
    }
}
