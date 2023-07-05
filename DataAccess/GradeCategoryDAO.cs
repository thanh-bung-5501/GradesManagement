using BusinessObjects;

namespace DataAccess
{
    public class GradeCategoryDAO
    {
        private static MyDBcontext _context = new MyDBcontext();
        public GradeCategoryDAO(MyDBcontext context)
        {
            _context = context;
        }
        public static List<GradeCategory> GetGradeCategories() => _context.GradeCategory.ToList();
    }
}
