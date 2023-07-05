using BusinessObjects;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public class GradesDTO
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

        public string CreatedBy { get; set; }

        public string ModifiedBy { get; set; }

        public UserDTO User { get; set; }

        public SubjectDTO Subject { get; set; }

        public GradeCategoryDTO GradeCategory { get; set; }
    }
}
