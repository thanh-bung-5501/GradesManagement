namespace WebAPI.Models
{
    public class SubjectDTO
    {
        public int Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public string? TeacherId { get; set; }

        public UserDTO? User { get; set; }
    }
}
