namespace WebAPI.Models
{
    public class UseCreateDTO
    {
        public string Fullname { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public int RoleId { get; set; }

        public int Status { get; set; }
    }
}
