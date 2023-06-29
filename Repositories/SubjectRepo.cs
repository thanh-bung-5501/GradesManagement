using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class SubjectRepo : ISubjectRepo
    {
        public List<Subject> GetSubjects() => SubjectDAO.GetSubjects();
        public Subject GetSubjectById(int id) => SubjectDAO.GetSubjectById(id); 
        public void Create(Subject x) => SubjectDAO.Create(x);
        public void Update(Subject x) => SubjectDAO.Update(x);
        public void Delete(int id) => SubjectDAO.Delete(id);
    }
}
