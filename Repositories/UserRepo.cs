using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class UserRepo : IUserRepo
    {
        public List<User> GetUsers() => UserDAO.GetUsers();
        public User GetUserById(string id) => UserDAO.GetUserById(id);
        public void Create(User x) => UserDAO.Create(x);
        public void Update(User x) => UserDAO.Update(x);
        public void Delete(string id) => UserDAO.Delete(id);
    }
}
