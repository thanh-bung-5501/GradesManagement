using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObjects
{
    public class User
    {
        [Key]
        public string Id { get; set; }     
        
        [StringLength(50)] 
        public string Fullname { get; set; }

        [StringLength(50)]
        public string Email { get; set; }
        
        [StringLength(50)]
        public string Password { get; set; }
        
        [StringLength(20)]
        public string? Phone { get; set; }

        [StringLength(50)]
        public string? Address { get; set; }

        public int RoleId { get; set; }

        public int Status { get; set; }

        public Role Role { get; set; }

        public ICollection<Subject>? Subjects { get; set; }
       
        public ICollection<Grades> Grades { get; set; }
    }
}
