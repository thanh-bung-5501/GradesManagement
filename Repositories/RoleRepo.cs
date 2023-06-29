using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class RoleRepo : IRoleRepo
    {
        public List<Role> GetRoles() => RoleDAO.GetRoles();
        //public User GetUserById(int id) => UserDAO.GetUserById(id);
        //public void Create(User x) => UserDAO.Create(x);
        //public void Update(User x) => UserDAO.Update(x);
        //public void Delete(int id) => UserDAO.Delete(id);
    }
}
