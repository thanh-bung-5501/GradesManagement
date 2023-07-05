using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class GradeCategoriyRepo : IGradeCategoryRepo
    {
        public List<GradeCategory> GetGradeCategories() => GradeCategoryDAO.GetGradeCategories();
    }
}
