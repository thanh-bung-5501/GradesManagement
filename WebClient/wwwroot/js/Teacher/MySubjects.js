﻿var token = localStorage.getItem('token');
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
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            if (response.role === 'Teacher') {
                // render subjects view
                RenderSubjects();
            } else {
                window.location.href = "/NotFound";
            }
        }
    });
}

function RenderSubjects() {
    // get userId by token
    $.ajax({
        url: 'https://localhost:5000/api/Authenticate/user/info',
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            if (response.id) {
                table.clear().draw(false);
                $.ajax({
                    url: `https://localhost:5000/odata/subject?$expand=user&$filter=TeacherId eq '${response.id}'`,
                    type: "GET",
                    dataType: 'json',
                    beforeSend: function (xhr) {
                        // Set the Bearer token in the Authorization header
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    },
                    success: function (listSubjects) {
                        var subjects = listSubjects.value;
                        // Create view data subjects
                        $.each(subjects, function (index, subject) {
                            table.row.add([
                                subject.Id,
                                subject.Code,
                                subject.Name,
                                subject.User.Fullname,
                                subject.User.Email,
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