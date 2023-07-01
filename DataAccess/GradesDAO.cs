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
        public static List<Grades> GetGrades() => _context.Grades.Include(x => x.User).ToList();

        public static Subject GetSubjectById(int id) => _context.Subject.SingleOrDefault(x => x.Id == id)!;
    }
}