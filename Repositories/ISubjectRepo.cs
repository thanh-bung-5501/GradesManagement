using BusinessObjects;

namespace Repositories
{
    public interface ISubjectRepo
    {
        List<Subject> GetSubjects();
        Subject GetSubjectById(int id);
        void Create(Subject x);
        void Update(Subject x);
        void Delete(int id);
    }
}