namespace WebAPI.Models
{
    public class GradesCreateDTO
    {
        public string StudentId { get; set; }

        public int SubjectId { get; set; }

        public int GradeCategoryId { get; set; }

        public decimal Grade { get; set; }

        public DateTime CreatedOn { get; set; }

        public DateTime ModifiedOn { get; set; }

        public string CreatedBy { get; set; }

        public string ModifiedBy { get; set; }
    }
}
