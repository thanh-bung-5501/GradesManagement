var table = $('table').DataTable({
    autoWidth: true,
});

$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    Authorize();
});

function Authorize() {
    $.ajax({
        url: 'https://localhost:5000/api/Authenticate/user/info',
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {
            if (response.role === 'Student') {
                // render grades view
                RenderGrades();
            } else {
                window.location.href = "/NotFound";
            }
        }
    });
}

function RenderGrades() {
    $.ajax({
        url: 'https://localhost:5000/api/Authenticate/user/info',
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {
            if (response.id) {

                table.clear().draw(false);
                $.ajax({
                    url: `https://localhost:5000/odata/grades?$expand=User,GradeCategory,Subject&$filter=User/Id eq '${response.id}'`,
                    type: "GET",
                    dataType: 'json',
                    beforeSend: function (xhr) {
                        // Set the Bearer token in the Authorization header
                        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
                    },
                    success: function (listGrades) {
                        var grades = listGrades.value;
                        // Create view data grades
                        $.each(grades, function (index, grade) {
                            table.row.add([
                                grade.StudentId,
                                grade.User.Fullname,
                                grade.Subject.Code,
                                grade.GradeCategory.Name,
                                grade.Grade,
                            ]).draw(false);
                        });
                    }
                });
            } else {
                console.log("Id is null");
            }
        },
        error: function (xhr, status, error) {
            // Handle errors, if any
            console.log('Error:', xhr);
        }
    });
}