using BusinessObjects;

namespace DataAccess
{
    public class GradesDAO
    {
        private MyDBcontext context;
        public GradesDAO(MyDBcontext context)
        {
            this.context = context;
        }
        public List<Grades> GetGrades()
        {
            return context.Grades.ToList();
        }
    }
}