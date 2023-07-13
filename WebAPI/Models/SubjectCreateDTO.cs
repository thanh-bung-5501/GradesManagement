namespace WebAPI.Models
{
    public class SubjectCreateDTO
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string? TeacherId { get; set; }
    }
}
