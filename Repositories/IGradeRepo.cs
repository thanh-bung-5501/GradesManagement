using BusinessObjects;

namespace Repositories
{
    public interface IGradeRepo
    {
        List<Grades> GetGrades();
        Grades GetGradeByKeys(string stuId, int subId, int gradeCatId);
        void Create(Grades grade);
        void BulkCreate(List<Grades> grades);
    }
}