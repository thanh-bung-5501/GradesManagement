using BusinessObjects;

namespace Repositories
{
    public interface IGradeRepo
    {
        List<Grades> GetGrades();
        List<Grades> GetGradesByTeacherId(string id);
        Grades GetGradeByKeys(string stuId, int subId, int gradeCatId);
        void Create(Grades grade);
        void BulkCreate(List<Grades> grades);
        void Update(Grades grade);
        void Delete(string StudentId, int SubjectId, int GradeCatId);
    }
}