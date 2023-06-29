using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BusinessObjects
{
    public class Grades
    {
        [Key]
        [Column(Order = 0)]
        public string StudentId { get; set; }

        [Key]
        [Column(Order = 1)]
        public int SubjectId { get; set; }

        [Key]
        [Column(Order = 2)]
        public int GradeCategoryId { get; set; }

        public decimal Grade { get; set; }

        public DateTime CreatedOn { get; set; }

        public DateTime ModifiedOn { get; set; }

        public int CreatedBy { get; set; }

        public int ModifiedBy { get; set; }

        public User User { get; set; }

        public Subject Subject { get; set; }

        public GradeCategory GradeCategory { get; set; }
    }
}
