using AutoMapper;
using BusinessObjects;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Formatter;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using System.Collections.Generic;
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
        public IActionResult Get()
        {
            var users = _repo.GetUsers();
            var userDTOs = _Mapper.Map<List<UserDTO>>(users);
            return Ok(userDTOs);
        }

        [HttpPost]
        [Route("api/user/generate-user-id")]
        public IActionResult GenerateUserID()
        {
            // Generate a unique user ID
            string userID = Guid.NewGuid().ToString();

            // Return the generated ID in the response
            return Ok(new { id = userID });
        }

        [EnableQuery]
        public IActionResult Get([FromODataUri] string key)
        {
            var user = _repo.GetUserById(key);
            var userDTO = _Mapper.Map<UserDTO>(user);
            return Ok(userDTO);
        }

        [HttpGet]
        [Route("api/user/users-insert-template")]
        public ActionResult DownloadTemplate()
        {
            var roles = new List<string>() { "teacher", "student" };
            var status = new List<string>() { "block", "active" };
            var _ref = ReferenceTemplate(roles, status);
            var _udata = InsertTemplate();

            using (XLWorkbook wb = new XLWorkbook())
            {
                wb.AddWorksheet(_udata, "Insert Users");
                wb.AddWorksheet(_ref, "Reference");

                var worksheet = wb.Worksheet("Insert Users");
                var worksheetRef = wb.Worksheet("Reference");

                worksheet.Column(6).SetDataValidation().List(worksheetRef.Range("A2:A4"), true);
                worksheet.Column(7).SetDataValidation().List(worksheetRef.Range("B2:B4"), true);
                worksheetRef.Hide();

                using (MemoryStream ms = new MemoryStream())
                {
                    wb.SaveAs(ms);
                    return File(ms.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Insert Users Template");
                };
            }
        }

        [NonAction]
        private DataTable InsertTemplate()
        {
            DataTable dt = new DataTable();
            dt.TableName = "Udata";

            dt.Columns.Add("Fullname", typeof(string));
            dt.Columns.Add("Email", typeof(string));
            dt.Columns.Add("Password", typeof(string));
            dt.Columns.Add("Phone", typeof(string));
            dt.Columns.Add("Address", typeof(string));
            dt.Columns.Add("Role", typeof(string));
            dt.Columns.Add("Status", typeof(string));
            for (int i = 0; i < 20; i++)
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
            dt.TableName = "Udata";
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

        [HttpPost]
        [Route("api/user/import-users")]
        public IActionResult UploadFile(IFormFile file)
        {
            if (file != null && file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                using (var workbook = new XLWorkbook(stream))
                {
                    // Template
                    DataTable dataTable = InsertTemplate();
                    // List error
                    List<string> lsError = new List<string>();
                    // Get the worksheet from the workbook
                    IXLWorksheet worksheet = workbook.Worksheet(1);
                    // Get the range of cells with data in the worksheet
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

        public IActionResult Post([FromBody] UserCreateDTO userCreate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            User newUser = _Mapper.Map<User>(userCreate);
            newUser.Id = Guid.NewGuid().ToString();

            //return Ok(newUser);
            _repo.Create(newUser);
            return NoContent();
        }

        //public IActionResult Put([FromODataUri] int key, [FromBody] UserDTO userDTO)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    if (key != userDTO.Id)
        //    {
        //        return BadRequest();
        //    }
        //    User newUser = _Mapper.Map<User>(userDTO);
        //    _repo.Update(newUser);
        //    return NoContent();
        //}

        //public IActionResult Delete([FromODataUri] int key)
        //{
        //    var user = _repo.GetUserById(key);
        //    if (user is null)
        //    {
        //        return BadRequest();
        //    }
        //    _repo.Delete(user.Id);
        //    return NoContent();
        //}
    }
}
