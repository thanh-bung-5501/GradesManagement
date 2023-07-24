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
        public static List<Grades> GetGradesByTeacherId(string id)
        {
            var rs = _context.Grades.Include(x => x.GradeCategory)
                .Include(x => x.User)
                .Include(x => x.Subject)
                .Where(x => x.Subject.TeacherId.Equals(id))
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

        public static void Update(Grades newGrade)
        {
            var oldGrade = _context.Grades.SingleOrDefault(g => g.StudentId == newGrade.StudentId
                && g.SubjectId == newGrade.SubjectId && g.GradeCategoryId == newGrade.GradeCategoryId);

            if (oldGrade != null)
            {
                oldGrade.Grade = newGrade.Grade;
                oldGrade.ModifiedOn = newGrade.ModifiedOn;
                oldGrade.ModifiedBy = newGrade.ModifiedBy;
                _context.SaveChanges();
            }
        }

        public static void BulkCreate(List<Grades> grades)
        {
            _context.Grades.AddRange(grades);
            _context.SaveChanges();
        }

        public static void Delete(string StudentId, int SubjectId, int GradeCatId)
        {
            var found = _context.Grades.SingleOrDefault(g => g.StudentId == StudentId
                && g.SubjectId == SubjectId && g.GradeCategoryId == GradeCatId);

            if(found!= null)
            {
                _context.Grades.Remove(found);
                _context.SaveChanges();
            }
        }
    }
}