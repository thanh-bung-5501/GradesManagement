namespace WebAPI.Models
{
    public class GradesUpdateDTO
    {
        public string StudentId { get; set; }

        public int SubjectId { get; set; }

        public int GradeCategoryId { get; set; }

        public decimal Grade { get; set; }

        public DateTime ModifiedOn { get; set; }

        public string ModifiedBy { get; set; }
    }
}
