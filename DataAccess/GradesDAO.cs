using BusinessObjects;
using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public class GradesDAO
    {
        private static MyDBcontext _context = new MyDBcontext();
        public GradesDAO(MyDBcontext context)
        {
            _context = context;
        }
        public static List<Grades> GetGrades()
        {
            var rs = _context.Grades.Include(x => x.GradeCategory)
                .Include(x => x.User)
                .Include(x => x.Subject)
                .ToList();
            return rs;
        }
    }
}