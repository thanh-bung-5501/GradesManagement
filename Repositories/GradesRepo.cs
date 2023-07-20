using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class GradesRepo : IGradeRepo
    {
        public List<Grades> GetGrades() => GradesDAO.GetGrades();
        public Grades GetGradeByKeys(string stuId, int subId, int gradeCatId) => GradesDAO.GetGradeByKeys(stuId, subId, gradeCatId);
        public void Create(Grades grade) => GradesDAO.Create(grade);
        public void BulkCreate(List<Grades> grades) => GradesDAO.BulkCreate(grades);
    }
}