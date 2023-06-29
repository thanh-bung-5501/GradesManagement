using BusinessObjects;

namespace DataAccess
{
    public class RoleDAO
    {
        private static MyDBcontext _context = new MyDBcontext();
        public RoleDAO(MyDBcontext context)
        {
            _context = context;
        }

        public static List<Role> GetRoles() => _context.Role.ToList();

        //public static User GetUserById(int id) => _context.User.SingleOrDefault(x => x.Id == id)!;

        //public static void Create(User user)
        //{
        //    _context.User.Add(user);
        //    _context.SaveChanges();
        //}

        //public static void Update(User x)
        //{
        //    var result = GetUserById(x.Id);
        //    if (result != null)
        //    {
        //        result.Fullname = x.Fullname;
        //        result.Password = x.Password;
        //        result.Phone = x.Phone;
        //        result.Address = x.Address;
        //        result.Role = x.Role;
        //        result.Status = x.Status;
        //        _context.SaveChanges();
        //    }
        //}
        //public static void Delete(int id)
        //{
        //    _context.User.Remove(_context.User.SingleOrDefault(b => b.Id == id)!);
        //    _context.SaveChanges();
        //}
    }
}
