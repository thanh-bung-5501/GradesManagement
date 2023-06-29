using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObjects
{
    public class GradeCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [MaxLength(50)]
        public string Name { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
        [MaxLength(20)]
        public string CreatedBy { get; set; }
        [MaxLength(20)]
        public string ModifiedBy { get; set; }
        public ICollection<Grades> Grades { get; set; }
    }
}
