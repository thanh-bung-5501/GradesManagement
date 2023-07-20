using AutoMapper;
using BusinessObjects;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Office2010.Excel;
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
        [Route("api/grades/export-grades")]
        public ActionResult ExportGrades()
        {
            var _gData = GetGradesData();
            using (XLWorkbook wb = new XLWorkbook())
            {
                wb.AddWorksheet(_gData, "Grades Recods");
                var wsMain = wb.Worksheet("Grades Recods");
                wsMain.Columns().AdjustToContents();
                using (MemoryStream ms = new MemoryStream())
                {
                    wb.SaveAs(ms);
                    return File(ms.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Users Data");
                };
            }
        }

        [NonAction]
        private DataTable GetGradesData()
        {
            DataTable dt = new DataTable();
            dt.TableName = "Grades data";
            dt.Columns.Add("StudentId", typeof(string));
            dt.Columns.Add("StudentName", typeof(string));
            dt.Columns.Add("SubjectCode", typeof(string));
            dt.Columns.Add("GradeCategory", typeof(string));
            dt.Columns.Add("Grade", typeof(string));
            dt.Columns.Add("CreatedOn", typeof(string));
            dt.Columns.Add("ModifiedOn", typeof(string));
            dt.Columns.Add("CreatedBy", typeof(string));
            dt.Columns.Add("ModifiedBy", typeof(string));

            var _list = _repoG.GetGrades();
            if (_list.Count > 0)
            {
                _list.ForEach(item =>
                {
                    dt.Rows.Add(item.StudentId, item.User.Fullname, item.Subject.Code, item.GradeCategory.Name,
                        item.Grade, item.CreatedOn, item.ModifiedOn, item.CreatedBy, item.ModifiedBy);
                });
            }
            return dt;
        }

        [HttpPost]
        [Route("api/grades/import-grades")]
        public ActionResult UploadFile(IFormFile file)
        {
            if (file != null && file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                using (var workbook = new XLWorkbook(stream))
                {
                    // Template
                    DataTable dataTable = TableTemplate();
                    // List error
                    List<string> lsError = new List<string>();
                    // Get the wsMain from the workbook
                    IXLWorksheet wsMain = workbook.Worksheet(1);
                    IXLWorksheet wsRefStudents = workbook.Worksheet(2);
                    IXLWorksheet wsRefSubjects = workbook.Worksheet(3);
                    IXLWorksheet wsRefGradeCategories = workbook.Worksheet(4);
                    // Validate the sheet names
                    if (wsMain.Name != "Insert Grades" || wsRefStudents.Name != "Reference Students"
                        || wsRefSubjects.Name != "Reference Subjects" || wsRefGradeCategories.Name != "Reference Grade Categories")
                        return BadRequest($"[File input] Sheet names mismatch [Template] sheet names.");

                    // Get the rangeWsMain of cells with data in the wsMain
                    IXLRange rangeWsMain = wsMain.RangeUsed();
                    IXLRange rangeWsStudents = wsRefStudents.RangeUsed();
                    IXLRange rangeWsSubjects = wsRefSubjects.RangeUsed();
                    IXLRange rangeWsGradeCats = wsRefGradeCategories.RangeUsed();

                    DataTable dTableMain = new DataTable();

                    // Add columns to the dTableMain based on the Excel file headers
                    foreach (IXLCell cell in rangeWsMain.FirstRow().CellsUsed()) dTableMain.Columns.Add(cell.Value.ToString()); ;

                    // Validate match sheets reference
                    var totalStudents = _repoU.GetStudentsActive();
                    var totalSubjects = _repoS.GetSubjects();
                    var totalGradeCats = _repoGC.GetGradeCategories();

                    if (totalStudents.Count != rangeWsStudents.RowsUsed().Skip(1).Count()
                        || totalSubjects.Count != rangeWsSubjects.RowsUsed().Skip(1).Count()
                        || totalGradeCats.Count != rangeWsGradeCats.RowsUsed().Skip(1).Count())
                        return BadRequest($"(File input) [Sheets Reference] is the old template. Please download the new template!");

                    // Validate the column count and names
                    if (dataTable.Columns.Count != dTableMain.Columns.Count)
                    {
                        int countCol = dataTable.Columns.Count;
                        int countCol2 = dTableMain.Columns.Count;
                        // Column count does not match
                        return BadRequest($"(Template[{countCol}]-File input[{countCol2}]) Column count mismatch.");
                    }

                    // Validate match column
                    for (int i = 0; i < dataTable.Columns.Count; i++)
                    {
                        if (dataTable.Columns[i].ColumnName != dTableMain.Columns[i].ColumnName)
                        {
                            string nameCol = dataTable.Columns[i].ColumnName;
                            string nameCol2 = dTableMain.Columns[i].ColumnName;
                            // Column name does not match
                            return BadRequest($"(Tempate[{nameCol}]-File input[{nameCol2}]) Column name mismatch.");
                        }
                    }

                    // assign data to List
                    List<GradesCreateDTO> gradeDTOs = new List<GradesCreateDTO>();

                    bool emptyTable = true;
                    // Validate the row data
                    foreach (IXLRangeRow row in rangeWsMain.RowsUsed().Skip(1)) // Skip the header row
                    {
                        for (int i = 0; i < row.Cells().Count(); i += 2)
                        {
                            // pass empty row
                            if (row.Cell(1).Value.IsBlank && row.Cell(3).Value.IsBlank
                                && row.Cell(5).Value.IsBlank && row.Cell(7).Value.IsBlank) break;
                            else // not empty row
                            {
                                // Cell null or empty
                                if (row.Cell(i + 1).Value.IsBlank)
                                {
                                    IXLCell cell = row.Cell(i + 1);
                                    lsError.Add($"({cell.Address}) Cell value is either null or empty.");
                                }
                                // check empty table
                                if (emptyTable == true) emptyTable = false;
                            }
                        }

                        // Validate conflict data in db
                        if (!row.Cell(1).Value.IsBlank && !row.Cell(3).Value.IsBlank
                                && !row.Cell(5).Value.IsBlank && !row.Cell(7).Value.IsBlank)
                        {
                            string stuId = row.Cell(1).Value.GetText();
                            int subId = int.Parse(row.Cell(3).Value.GetText());
                            int gradeCatId = int.Parse(row.Cell(5).Value.GetText());
                            decimal grade = decimal.Parse(row.Cell(7).Value.ToString());
                            var found = _repoG.GetGradeByKeys(stuId, subId, gradeCatId);
                            if (found != null)
                            {
                                lsError.Add($"(File input[{row.RangeAddress}]) Student({found.StudentId}) has been graded ({found.Grade}) in {found.GradeCategory.Name} [{found.Subject.Code}].");
                            }
                            else
                            {
                                var gradesDTO = new GradesCreateDTO
                                {
                                    StudentId = stuId,
                                    SubjectId = subId,
                                    GradeCategoryId = gradeCatId,
                                    Grade = grade,
                                };
                                gradeDTOs.Add(gradesDTO);
                            }
                        }
                    }

                    // Validate empty table
                    if (emptyTable == true) return BadRequest("File input does not have data.");

                    // Validate Conflict 
                    if (gradeDTOs.GroupBy(x => new { x.StudentId, x.SubjectId, x.GradeCategoryId }).Any(c => c.Count() > 1))
                    {
                        var valueDuplicate = gradeDTOs.GroupBy(x => new { x.StudentId, x.SubjectId, x.GradeCategoryId }).Where(g => g.Count() > 1).Select(y => y.Key);
                        foreach (var item in valueDuplicate) lsError.Add($"(File input) A duplicate data {item}");
                    }

                    // Have error
                    if (lsError.Count != 0) return BadRequest(lsError);
                    // Not have error
                    else
                    {
                        try
                        {
                            foreach (var item in gradeDTOs)
                            {
                                item.CreatedOn = DateTime.Now;
                                item.ModifiedOn = DateTime.Now;
                                item.CreatedBy = "Admin";
                                item.ModifiedBy = "Admin";
                            }
                            List<Grades> grades = _Mapper.Map<List<Grades>>(gradeDTOs);
                            _repoG.BulkCreate(grades);
                            return NoContent();
                        }
                        catch (Exception e)
                        {
                            return BadRequest(new { message = $"{e.Message}" });
                        }
                    }
                }
            }
            return BadRequest("No file was uploaded.");
        }

        [HttpGet]
        [Route("api/grades/grades-insert-template")]
        public ActionResult DownloadTemplate()
        {
            // load datatable References
            var _refStudents = ReferenceStudents(_repoU.GetStudentsActive());
            var _refSubjects = ReferenceSubjects(_repoS.GetSubjects());
            var _refGradeCategories = ReferenceGradeCategories(_repoGC.GetGradeCategories());

            // count row references
            int rowRefStudents = _refStudents.Rows.Count;
            int rowRefSubjects = _refSubjects.Rows.Count;
            int rowRefGradeCategories = _refGradeCategories.Rows.Count;
            var _udata = TableTemplate();

            using (XLWorkbook wb = new XLWorkbook())
            {
                // add wsMain to workbook
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
                // assign vlookup rangeWsMain
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
