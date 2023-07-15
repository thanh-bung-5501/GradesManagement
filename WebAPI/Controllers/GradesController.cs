using AutoMapper;
using BusinessObjects;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using System.Data;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class GradesController : ODataController
    {
        private IGradeRepo _repoG = new GradesRepo();
        private IUserRepo _repoU = new UserRepo();
        private ISubjectRepo _repoS = new SubjectRepo();
        private IGradeCategoryRepo _repoGC = new GradeCategoryRepo();
        private IMapper _Mapper { get; }
        public GradesController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        [EnableQuery]
        public ActionResult Get()
        {
            var grades = _repoG.GetGrades();
            var gradeDTOs = _Mapper.Map<List<GradesDTO>>(grades);
            return Ok(gradeDTOs);
        }

        [HttpGet]
        [Route("api/grades/grades-insert-template")]
        public ActionResult DownloadTemplate()
        {
            // load datatable References
            var _refStudents = ReferenceStudents(_repoU.GetUsers());
            var _refSubjects = ReferenceSubjects(_repoS.GetSubjects());
            var _refGradeCategories = ReferenceGradeCategories(_repoGC.GetGradeCategories());

            // count row references
            int rowRefStudents = _refStudents.Rows.Count;
            int rowRefSubjects = _refSubjects.Rows.Count;
            int rowRefGradeCategories = _refGradeCategories.Rows.Count;
            var _udata = TableTemplate();

            using (XLWorkbook wb = new XLWorkbook())
            {
                // add worksheet to workbook
                wb.AddWorksheet(_udata, "Insert Grades");
                wb.AddWorksheet(_refStudents, "Reference Students");
                wb.AddWorksheet(_refSubjects, "Reference Subjects");
                wb.AddWorksheet(_refGradeCategories, "Reference Grade Categories");

                // assign worksheets
                var wsMain = wb.Worksheet("Insert Grades");
                var wsStudents = wb.Worksheet("Reference Students");
                var wsSubjects = wb.Worksheet("Reference Subjects");
                var wsGradeCategories = wb.Worksheet("Reference Grade Categories");

                // set validations to wsMain
                wsMain.Range("A2:A51").SetDataValidation().List(wsStudents.Range("A2:A" + (rowRefStudents + 1)), true);
                wsMain.Range("C2:C51").SetDataValidation().List(wsSubjects.Range("A2:A" + (rowRefSubjects + 1)), true);
                wsMain.Range("E2:E51").SetDataValidation().List(wsSubjects.Range("A2:A" + (rowRefGradeCategories + 1)), true);
                wsMain.Range("G2:G51").SetDataValidation().Decimal.Between(0, 10);
                wsMain.Range("G2:G51").SetDataValidation().ErrorTitle = "Validation Error";
                wsMain.Range("G2:G51").SetDataValidation().ErrorMessage = "Please enter a number between 0 and 10.";
                // assign vlookup range
                var lookupRangeStudents = wsStudents.Range("A2:B" + (rowRefStudents + 1));
                var lookupRangeSubjects = wsSubjects.Range("A2:B" + (rowRefSubjects + 1));
                var lookupRangeGradeCategories = wsGradeCategories.Range("A2:B" + (rowRefGradeCategories + 1));

                // Perform the VLOOKUP operation for References 50 rows
                for (int i = 2; i <= 51; i++) // i = 2 => skip header
                {
                    var studentIdCol = wsMain.Column(1).Cell(i);
                    var vlookupFormulaStudents = $"=IFERROR(VLOOKUP({studentIdCol.Address}, '{wsStudents.Name}'!{lookupRangeStudents.RangeAddress}, 2, FALSE), \"\")";
                    var studentNameCol = wsMain.Column(2).Cell(i);
                    studentNameCol.FormulaA1 = vlookupFormulaStudents;

                    var subjectIdCol = wsMain.Column(3).Cell(i);
                    var vlookupFormulaSubjects = $"=IFERROR(VLOOKUP({subjectIdCol.Address}, '{wsSubjects.Name}'!{lookupRangeSubjects.RangeAddress}, 2, FALSE), \"\")";
                    var subjectCodeCol = wsMain.Column(4).Cell(i);
                    subjectCodeCol.FormulaA1 = vlookupFormulaSubjects;

                    var gradeCatIdCol = wsMain.Column(5).Cell(i);
                    var vlookupFormulaGradeCats = $"=IFERROR(VLOOKUP({gradeCatIdCol.Address}, '{wsGradeCategories.Name}'!{lookupRangeGradeCategories.RangeAddress}, 2, FALSE), \"\")";
                    var gradeCatNameCol = wsMain.Column(6).Cell(i);
                    gradeCatNameCol.FormulaA1 = vlookupFormulaGradeCats;
                }

                // Set style fow wsMain
                wsMain.Protect("123456");
                wsMain.Column(1).Style.Protection.SetLocked(false);
                wsMain.Column(3).Style.Protection.SetLocked(false);
                wsMain.Column(5).Style.Protection.SetLocked(false);
                wsMain.Column(7).Style.Protection.SetLocked(false);
                wsMain.Columns().AdjustToContents();
                wsMain.Column(1).Width = 36;
                wsStudents.Protect("123456");
                wsStudents.Columns().AdjustToContents();
                wsSubjects.Protect("123456");
                wsSubjects.Columns().AdjustToContents();
                wsGradeCategories.Protect("123456");
                wsGradeCategories.Columns().AdjustToContents();

                // save wb
                using (MemoryStream ms = new MemoryStream())
                {
                    wb.SaveAs(ms);
                    return File(ms.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Insert Grades Template");
                };
            }
        }
        [NonAction]
        private DataTable TableTemplate()
        {
            DataTable dt = new DataTable();
            dt.TableName = "Insert Grades";

            // add column for wsMain
            dt.Columns.Add("StudentId", typeof(string));
            dt.Columns.Add("StudentName", typeof(string));
            dt.Columns.Add("SubjectId", typeof(string));
            dt.Columns.Add("SubjectCode", typeof(string));
            dt.Columns.Add("GradeCategoryId", typeof(string));
            dt.Columns.Add("GradeCategoryName", typeof(string));
            dt.Columns.Add("Grade", typeof(string));

            // add 50 row for wsMain
            for (int i = 1; i <= 50; i++)
            {
                dt.Rows.Add("", "", "", "", "", "", "");
            }
            return dt;
        }

        [NonAction]
        private DataTable ReferenceGradeCategories(List<GradeCategory> gradeCategories)
        {
            DataTable validationTable = new DataTable();
            validationTable.TableName = "Reference Grade Categories";
            validationTable.Columns.Add("Id");
            validationTable.Columns.Add("Name");

            DataRow dr;
            // insert data to table validation
            for (int i = 0; i < gradeCategories.Count; i++)
            {
                dr = validationTable.NewRow();
                dr["Id"] = gradeCategories[i].Id;
                dr["Name"] = gradeCategories[i].Name;
                validationTable.Rows.Add(dr);
            }
            return validationTable;
        }

        [NonAction]
        private DataTable ReferenceStudents(List<User> students)
        {
            DataTable validationTable = new DataTable();
            validationTable.TableName = "Reference Students";
            validationTable.Columns.Add("Id");
            validationTable.Columns.Add("Fullname");

            DataRow dr;
            // insert data to table validation
            for (int i = 0; i < students.Count; i++)
            {
                dr = validationTable.NewRow();
                dr["Id"] = students[i].Id;
                dr["Fullname"] = students[i].Fullname;
                validationTable.Rows.Add(dr);
            }
            return validationTable;
        }

        [NonAction]
        private DataTable ReferenceSubjects(List<Subject> subjects)
        {
            DataTable validationTable = new DataTable();
            validationTable.TableName = "Reference Subjects";
            validationTable.Columns.Add("Id");
            validationTable.Columns.Add("Code");

            DataRow dr;
            // insert data to table validation
            for (int i = 0; i < subjects.Count; i++)
            {
                dr = validationTable.NewRow();
                dr["Id"] = subjects[i].Id;
                dr["Code"] = subjects[i].Code;
                validationTable.Rows.Add(dr);
            }
            return validationTable;
        }
    }
}
