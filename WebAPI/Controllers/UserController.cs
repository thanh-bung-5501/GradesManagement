using AutoMapper;
using BusinessObjects;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Formatter;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using System.Data;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class UserController : ODataController
    {
        private IUserRepo _repo = new UserRepo();
        private IMapper _Mapper { get; }
        public UserController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        [EnableQuery]
        public ActionResult Get()
        {
            var users = _repo.GetUsers();
            var userDTOs = _Mapper.Map<List<UserDTO>>(users);
            return Ok(userDTOs);
        }

        [Authorize(Roles = "Admin,Teacher")]
        [EnableQuery]
        public ActionResult Get([FromODataUri] string key)
        {
            var user = _repo.GetUserById(key);
            var userDTO = _Mapper.Map<UserDTO>(user);
            return Ok(userDTO);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        [Route("api/user/users-insert-template")]
        public ActionResult DownloadTemplate()
        {
            // load datatable References
            var roles = new List<string>() { "teacher", "student" };
            var status = new List<string>() { "block", "active" };
            var _ref = ReferenceTemplate(roles, status);
            var _udata = TableTemplate();

            using (XLWorkbook wb = new XLWorkbook())
            {
                // add worksheet to workbook
                wb.AddWorksheet(_udata, "Insert Users");
                wb.AddWorksheet(_ref, "Reference");

                // assign worksheets
                var wsMain = wb.Worksheet("Insert Users");
                var worksheetRef = wb.Worksheet("Reference");

                // create range to assign validations for the corresponding sheets
                var roleDataValidation = wsMain.Range("F2:F51").CreateDataValidation();
                var statusDataValidation = wsMain.Range("G2:G51").CreateDataValidation();

                // set validations to wsMain
                roleDataValidation.List(worksheetRef.Range("A2:A4"), true);
                statusDataValidation.List(worksheetRef.Range("B2:B4"), true);

                // Set style for wsMain
                wsMain.Columns().AdjustToContents();
                wsMain.Column(1).Width = 20;
                wsMain.Column(2).Width = 20;
                worksheetRef.Protect("123456");
                worksheetRef.Columns().AdjustToContents();

                // hide ws references
                worksheetRef.Hide();

                // save wb
                using (MemoryStream ms = new MemoryStream())
                {
                    wb.SaveAs(ms);
                    return File(ms.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Insert Users Template");
                };
            }
        }

        [NonAction]
        private DataTable TableTemplate()
        {
            DataTable dt = new DataTable();
            dt.TableName = "Insert Users";

            dt.Columns.Add("Fullname", typeof(string));
            dt.Columns.Add("Email", typeof(string));
            dt.Columns.Add("Password", typeof(string));
            dt.Columns.Add("Phone", typeof(string));
            dt.Columns.Add("Address", typeof(string));
            dt.Columns.Add("Role", typeof(string));
            dt.Columns.Add("Status", typeof(string));
            for (int i = 1; i <= 50; i++)
            {
                dt.Rows.Add("", "", "", "", "", "", "");
            }
            return dt;
        }

        [NonAction]
        private DataTable ReferenceTemplate(List<string> roles, List<string> status)
        {
            DataTable validationTable = new DataTable();
            validationTable.TableName = "Reference";
            validationTable.Columns.Add("Roles");
            validationTable.Columns.Add("Status");

            DataRow dr;
            // add data roles_ref and status_ref
            for (int i = 0; i < roles.Count; i++)
            {
                dr = validationTable.NewRow();
                dr["Roles"] = roles[i];
                dr["Status"] = status[i];
                validationTable.Rows.Add(dr);
            }
            return validationTable;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        [Route("api/user/export-users")]
        public ActionResult ExportUsers()
        {
            var _udata = GetUserData();
            using (XLWorkbook wb = new XLWorkbook())
            {
                wb.AddWorksheet(_udata, "Users Recods");
                using (MemoryStream ms = new MemoryStream())
                {
                    wb.SaveAs(ms);
                    return File(ms.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Users Data");
                };
            }
        }

        [NonAction]
        private DataTable GetUserData()
        {
            DataTable dt = new DataTable();
            dt.TableName = "Users data";
            dt.Columns.Add("Id", typeof(string));
            dt.Columns.Add("Fullname", typeof(string));
            dt.Columns.Add("Email", typeof(string));
            dt.Columns.Add("Phone", typeof(string));
            dt.Columns.Add("Address", typeof(string));
            dt.Columns.Add("Role", typeof(string));
            dt.Columns.Add("Status", typeof(string));

            var _list = _repo.GetUsers();
            if (_list.Count > 0)
            {
                _list.ForEach(item =>
                {
                    dt.Rows.Add(item.Id, item.Fullname, item.Email, item.Phone,
                        item.Address, item.Role.Name, item.Status == 0 ? "block" : "active");
                });
            }
            return dt;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Route("api/user/import-users")]
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
                    IXLWorksheet worksheet = workbook.Worksheet(1);
                    // Get the range of cells with data in the wsMain
                    IXLRange range = worksheet.RangeUsed();
                    // Validate the column structure
                    DataTable excelDataTable = new DataTable();
                    // Add columns to the excelDataTable based on the Excel file headers
                    foreach (IXLCell cell in range.FirstRow().CellsUsed())
                    {
                        excelDataTable.Columns.Add(cell.Value.ToString());
                    }
                    // Validate the column count and names
                    if (dataTable.Columns.Count != excelDataTable.Columns.Count)
                    {
                        int countCol = dataTable.Columns.Count;
                        int countCol2 = excelDataTable.Columns.Count;
                        // Column count does not match
                        return BadRequest($"(Template[{countCol}]-File input[{countCol2}]) Column count mismatch.");

                    }
                    // Validate match column
                    for (int i = 0; i < dataTable.Columns.Count; i++)
                    {
                        if (dataTable.Columns[i].ColumnName != excelDataTable.Columns[i].ColumnName)
                        {
                            string nameCol = dataTable.Columns[i].ColumnName;
                            string nameCol2 = excelDataTable.Columns[i].ColumnName;
                            // Column name does not match
                            return BadRequest($"(Tempate[{nameCol}]-File input[{nameCol2}]) Column name mismatch.");
                        }
                    }
                    // Validate empty table
                    if (range.RowsUsed().Skip(1).Count() == 0)
                    {
                        return BadRequest("File input does not have data.");
                    }
                    // Validate the row data
                    foreach (IXLRangeRow row in range.RowsUsed().Skip(1)) // Skip the header row
                    {
                        for (int i = 0; i < row.Cells().Count(); i++)
                        {
                            // Cell null or empty
                            if (row.Cell(i + 1).Value.IsBlank)
                            {
                                IXLCell cell = row.Cell(i + 1);
                                lsError.Add($"({cell.Address}) Cell value is either null or empty.");
                            }
                        }
                    }
                    // Have error
                    if (lsError.Count != 0) return BadRequest(lsError);
                    // Not have error
                    else
                    {
                        // add userDTOs to list
                        List<UserCreateDTO> userDTOs = new List<UserCreateDTO>();
                        foreach (IXLRangeRow row in range.RowsUsed().Skip(1)) // Skip the header row
                        {
                            string roleExcel = row.Cell(6).Value.ToString();
                            string statusExcel = row.Cell(7).Value.ToString();
                            // role = student, status = block
                            int roleId = 3, status = 0;
                            if (roleExcel.Equals("teacher")) roleId = 2;
                            if (statusExcel.Equals("active")) status = 1;

                            UserCreateDTO newUser = new UserCreateDTO
                            {
                                Id = Guid.NewGuid().ToString(),
                                Fullname = row.Cell(1).Value.ToString(),
                                Email = row.Cell(2).Value.ToString(),
                                Password = row.Cell(3).Value.ToString(),
                                Phone = row.Cell(4).Value.ToString(),
                                Address = row.Cell(5).Value.ToString(),
                                RoleId = roleId,
                                Status = status
                            };
                            userDTOs.Add(newUser);
                        }
                        List<User> users = _Mapper.Map<List<User>>(userDTOs);
                        _repo.BulkCreate(users);
                        return NoContent();
                    }
                }
            }
            return BadRequest("No file was uploaded.");
        }

        [Authorize(Roles = "Admin")]
        public ActionResult Post([FromBody] UserCreateDTO userCreate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            User newUser = _Mapper.Map<User>(userCreate);
            newUser.Id = Guid.NewGuid().ToString();
            _repo.Create(newUser);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        public ActionResult Put([FromODataUri] string key, [FromBody] UserCreateDTO userDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (key != userDTO.Id)
            {
                return BadRequest();
            }
            User newUser = _Mapper.Map<User>(userDTO);
            _repo.Update(newUser);
            return NoContent();
        }

        //public IActionResult Delete([FromODataUri] int key)
        //{
        //    var user = _repoG.GetUserById(key);
        //    if (user is null)
        //    {
        //        return BadRequest();
        //    }
        //    _repoG.Delete(user.Id);
        //    return NoContent();
        //}
    }
}
