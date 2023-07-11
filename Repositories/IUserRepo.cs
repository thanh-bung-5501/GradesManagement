using BusinessObjects;

namespace Repositories
{
    public interface IUserRepo
    {
        List<User> GetUsers();
        User GetUserById(string id);
        void Create(User x);
        void BulkCreate(List<User> x);
        void Update(User x);
        void Delete(string id);
    }
}