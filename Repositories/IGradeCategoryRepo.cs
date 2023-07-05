using BusinessObjects;

namespace Repositories
{
    public interface IGradeCategoryRepo
    {
        List<GradeCategory> GetGradeCategories();
    }
}