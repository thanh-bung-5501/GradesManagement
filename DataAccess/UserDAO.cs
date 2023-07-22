using BusinessObjects;
using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public class UserDAO
    {
        private static MyDBcontext _context = new MyDBcontext();
        public UserDAO(MyDBcontext context)
        {
            _context = context;
        }

        public static List<User> GetUsers() => _context.User.Include(x => x.Role).ToList();
        public static User GetUserByEmailAndPw(string email, string pw) => _context.User.Include(x => x.Role).SingleOrDefault(x => x.Email.Equals(email) && x.Password.Equals(pw))!;
        public static List<User> GetStudentsActive() => _context.User.Include(x => x.Role).Where(x => x.RoleId == 3 && x.Status == 1).ToList();

        public static User GetUserById(string id) => _context.User.SingleOrDefault(x => x.Id == id)!;

        public static void Create(User user)
        {
            _context.User.Add(user);
            _context.SaveChanges();
        }        
        
        public static void BulkCreate(List<User> users)
        {
            _context.User.AddRange(users);
            _context.SaveChanges();
        }

        public static void Update(User x)
        {
            var result = GetUserById(x.Id);
            if (result != null)
            {
                result.Fullname = x.Fullname;
                result.Email = x.Email;
                result.Password = x.Password;
                result.Phone = x.Phone;
                result.Address = x.Address;
                result.RoleId = x.RoleId;
                result.Status = x.Status;
                _context.SaveChanges();
            }
        }
        public static void Delete(string id)
        {
            _context.User.Remove(_context.User.SingleOrDefault(b => b.Id == id)!);
            _context.SaveChanges();
        }
    }
}
