using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class GradesRepo : IGradeRepo
    {
        public List<Grades> GetGrades() => GradesDAO.GetGrades();
    }
}