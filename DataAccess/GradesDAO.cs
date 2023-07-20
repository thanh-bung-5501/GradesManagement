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
        public static Grades GetGradeByKeys(string stuId, int subId, int gradeCatId)
        {
            var rs = _context.Grades.Include(x => x.GradeCategory)
                .Include(x => x.User)
                .Include(x => x.Subject).SingleOrDefault(x => x.StudentId.Equals(stuId)
                    && x.SubjectId == subId && x.GradeCategoryId == gradeCatId);
            return rs;
        }
        public static void Create(Grades grade)
        {
            _context.Grades.Add(grade);
            _context.SaveChanges();
        }

        public static void BulkCreate(List<Grades> grades)
        {
            _context.Grades.AddRange(grades);
            _context.SaveChanges();
        }
    }
}