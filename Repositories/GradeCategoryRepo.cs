using BusinessObjects;
using DataAccess;

namespace Repositories
{
    public class GradeCategoryRepo : IGradeCategoryRepo
    {
        public List<GradeCategory> GetGradeCategories() => GradeCategoryDAO.GetGradeCategories();
    }
}
