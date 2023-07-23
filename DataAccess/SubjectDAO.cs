using BusinessObjects;
using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public class SubjectDAO
    {
        private static MyDBcontext _context = new MyDBcontext();
        public SubjectDAO(MyDBcontext context)
        {
            _context = context;
        }

        public static List<Subject> GetSubjects() => _context.Subject.Include(x => x.User).ToList();
       
        public static List<Subject> GetSubjectByTeacherId(string id) => _context.Subject.Where(x => x.TeacherId.Equals(id)).ToList();

        public static Subject GetSubjectById(int id) => _context.Subject.SingleOrDefault(x => x.Id == id)!;

        public static void Create(Subject x)
        {
            _context.Subject.Add(x);
            _context.SaveChanges();
        }

        public static void Update(Subject x)
        {
            var result = GetSubjectById(x.Id);
            if (result != null)
            {
                result.Code = x.Code;
                result.Name = x.Name;
                result.TeacherId = x.TeacherId;
                _context.SaveChanges();
            }
        }
        public static void Delete(int id)
        {
            _context.Subject.Remove(_context.Subject.SingleOrDefault(b => b.Id == id)!);
            _context.SaveChanges();
        }
    }
}
