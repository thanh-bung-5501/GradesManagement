using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BusinessObjects
{
    public class MyDBcontext : DbContext
    {
        public MyDBcontext() { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            IConfigurationRoot configuration = builder.Build();
            optionsBuilder.UseSqlServer(configuration.GetConnectionString("connectDB"));
        }
        public virtual DbSet<Grades> Grades { get; set; }
        public virtual DbSet<Subject> Subject { get; set; }
        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<Role> Role { get; set; }
        public virtual DbSet<GradeCategory> GradeCategory { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(x => x.Email).IsUnique();
            modelBuilder.Entity<Subject>()
                .HasIndex(x => x.Code).IsUnique();

            modelBuilder.Entity<Grades>()
                .HasKey(grade => new
                {
                    grade.StudentId,
                    grade.SubjectId,
                    grade.GradeCategoryId
                });

            modelBuilder.Entity<Grades>()
                .HasOne(grade => grade.User)
                .WithMany(user => user.Grades)
                .HasForeignKey(grade => grade.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Grades>()
                .HasOne(grade => grade.Subject)
                .WithMany(subject => subject.Grades)
                .HasForeignKey(grade => grade.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Grades>()
                .HasOne(grade => grade.GradeCategory)
                .WithMany(gradeCat => gradeCat.Grades)
                .HasForeignKey(grade => grade.GradeCategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
