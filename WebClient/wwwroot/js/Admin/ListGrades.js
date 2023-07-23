var table = $('table').DataTable({
    autoWidth: true,
});

$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    // render grades view
    RenderGrades();

    $("#btn-add-grade").on("click", function () {
        ShowModelAdd();
    });

    $('#btn-import-grades').on('click', function () {
        $('#input-file').val(null);
        $('#show-error').empty();
        $('#modal-import-grades').modal('show');
    });

    $('#download-template').on('click', function () {
        DownloadTemplate();
    });

    $('#export-grades').on('click', function () {
        ExportGrades();
    });

    $('#form-import-grades').on('submit', function (event) {
        event.preventDefault();
        var formData = new FormData($('#form-import-grades')[0]);
        ImportGrades(formData);
    });

    $('#form-add-grade').on('submit', function (event) {
        event.preventDefault();
        SubmitFormAdd('#form-add-grade');
    });

    $('#form-edit-grade').on('submit', function (event) {
        event.preventDefault();
        SubmitFormEdit('#form-edit-grade');
    });
});

function SubmitFormAdd(selectorForm) {
    $.ajax({
        url: 'https://localhost:5000/api/Authenticate/user/info',
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {

            var dataGrade = {
                StudentId: $(selectorForm).find('select[name="studentId"]').val(),
                SubjectId: parseInt($(selectorForm).find('select[name="subjectId"]').val()),
                GradeCategoryId: parseInt($(selectorForm).find('select[name="gradeCategoryId"]').val()),
                Grade: parseFloat($(selectorForm).find('input[name="grade"]').val()),
                CreatedOn: new Date(),
                ModifiedOn: new Date(),
                CreatedBy: response.id,
                ModifiedBy: response.id,
            };

            $.ajax({
                url: "https://localhost:5000/odata/grades",
                type: "POST",
                data: JSON.stringify(dataGrade),
                contentType: "application/json",
                beforeSend: function (xhr) {
                    // Set the Bearer token in the Authorization header
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
                },
                success: function (response) {
                    // add new row datatable
                    RenderGrades();

                    // hide modal add
                    $("#add-modal").modal("hide");
                    showToastSuccess(`Add grade successfully!`);
                },
                error: function (xhr) {
                    $('#show-error-add').html(xhr.responseJSON.error.message);
                }
            });
        },
        error: function (error) {
            showToastFail(error);
        }
    });
}

function SubmitFormEdit(selectorForm) {
    $.ajax({
        url: 'https://localhost:5000/api/Authenticate/user/info',
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {

            var dataGrade = {
                studentId: $(selectorForm).find('input[name="studentId"]').val(),
                subjectId: parseInt($(selectorForm).find('input[name="subjectId"]').val()),
                gradeCategoryId: parseInt($(selectorForm).find('input[name="gradeCategoryId"]').val()),
                grade: parseFloat($(selectorForm).find('input[name="grade"]').val()),
                modifiedOn: new Date(),
                modifiedBy: response.id,
            };

            $.ajax({
                url: `https://localhost:5000/api/grades?studentId=${dataGrade.studentId}&subjectId=${dataGrade.subjectId}&gradeCategoryId=${dataGrade.gradeCategoryId}`,
                type: "PUT",
                data: JSON.stringify(dataGrade),
                contentType: "application/json",
                beforeSend: function (xhr) {
                    // Set the Bearer token in the Authorization header
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
                },
                success: function (response) {
                    // edit row datatable
                    RenderGrades();
                    // hide modal add
                    $("#edit-modal").modal("hide");
                    showToastSuccess(`Edit grade successfully!`);
                },
                error: function (error) {
                    console.error("Request failed. Error:", error);
                }
            });
        },
        error: function (error) {
            showToastFail(error);
        }
    });
}

function showToastSuccess(contentBody) {
    const toast = {
        type: 'success',
        body: `${contentBody}`
    };
    Toast(toast);
}

function showToastFail(contentBody) {
    const toast = {
        type: 'error',
        body: `${contentBody}`
    };
    Toast(toast);
}

function Toast({ type, body }) {
    var toastLiveExample = $('#liveToast');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    var toastTitle = $('#toast-title');
    var toastBody = $('#toast-body');

    if (type === 'success') {
        toastTitle.empty();
        toastTitle.removeClass();
        toastTitle.addClass('text-success');
        toastTitle.html(`
            <span class="fa-solid fa-circle-check"></span>
            <strong class="me-auto">Success</strong>
        `);

        toastBody.empty();
        toastBody.html(body);
    } else if (type === 'error') {
        toastTitle.empty();
        toastTitle.removeClass();
        toastTitle.addClass('text-danger');
        toastTitle.html(`
            <span class="fa-solid fa-circle-xmark"></span>
            <strong class="me-auto">Error</strong>
        `);

        toastBody.empty();
        toastBody.html(body);
    }
    toastBootstrap.show();
}

function ParseDateTime(inputDate) {
    var dateTime = new Date(inputDate);
    var formattedDateTime = dateTime.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    return formattedDateTime;
}

function LoadSelectSearchStudent(selectorSelectSearch, selectorModal, value) {
    $.ajax({
        url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Id eq 3`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (result, status, xhr) {
            $(selectorSelectSearch).append(`<optgroup label="[Id] Fullname"></optgroup>`);

            $.each(result.value, function (index, student) {
                $(`${selectorSelectSearch} optgroup`).append(`<option value="${student.Id}">[${student.Id}] ${student.Fullname}</option>`);
            });

            //select search
            $(selectorSelectSearch).select2({
                theme: "classic",
                minimumResultsForSearch: 1,
                width: 'resolve',
                dropdownParent: $(selectorModal),
                placeholder: "Select a student..."
            });

            // support show Placeholder
            $(selectorSelectSearch).val(value).trigger('change');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function LoadSelecSearchSubject(selectorSelectSearch, selectorModal, value) {
    $.ajax({
        url: `https://localhost:5000/odata/subject?$expand=User`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (result, status, xhr) {
            $(selectorSelectSearch).append(`<optgroup label="[Id] Code"></optgroup>`);
            $.each(result.value, function (index, subject) {
                $(selectorSelectSearch).append(`<option value="${subject.Id}">[${subject.Id}] ${subject.Code}</option>`);

            });

            // select search
            $(selectorSelectSearch).select2({
                theme: "classic",
                minimumResultsForSearch: 1,
                width: 'resolve',
                dropdownParent: $(selectorModal),
                placeholder: "Select a subject..."
            });
            // support show placeholder
            $(selectorSelectSearch).val(value).trigger('change');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function LoadSelectSearchGradeCategory(selectorSelectSearch, selectorModal, value) {
    $.ajax({
        url: `https://localhost:5000/odata/gradecategory`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (result, status, xhr) {
            $(selectorSelectSearch).append(`<optgroup label="Category"></optgroup>`);
            $.each(result.value, function (index, gradeCategory) {
                $(selectorSelectSearch).append(`<option value="${gradeCategory.Id}">${gradeCategory.Name}</option>`);
            });
            //select search
            $(selectorSelectSearch).select2({
                theme: "classic",
                minimumResultsForSearch: 1,
                width: 'resolve',
                dropdownParent: $(selectorModal),
                placeholder: "Select a grade category..."
            });
            // support show placeholder
            $(selectorSelectSearch).val(value).trigger('change');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function ShowModelAdd() {
    // clear data
    $('#add-student-id').empty();
    $('#add-subject-id').empty();
    $('#add-grade-category-id').empty();
    $('#add-grade').val(null);
    $('#show-error-add').html('');

    // load select search student
    LoadSelectSearchStudent('#add-student-id', '#add-modal', null);

    // load select search subject
    LoadSelecSearchSubject('#add-subject-id', '#add-modal', null);

    // load select search grade category
    LoadSelectSearchGradeCategory('#add-grade-category-id', '#add-modal', null);

    // show modal
    $("#add-modal").modal("show");
}

function ShowModalEdit(studentId, subjectId, gradeCatId) {
    // get api grade details
    $.ajax({
        url: `https://localhost:5000/odata/grades?$expand=user,subject,gradecategory&$filter=subjectid eq ${subjectId} and studentId eq '${studentId}' and gradeCategoryId eq ${gradeCatId}`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (grade, status, xhr) {
            // res only 1 record
            var result = grade.value[0];
            
            // load data
            $('#form-edit-grade input[name="studentId"]').val(result.StudentId);
            $('#edit-student-name').val(result.User.Fullname);

            $('#edit-subject-id').val(result.Subject.Code);
            $('#form-edit-grade input[name="subjectId"]').val(result.SubjectId);

            $('#edit-grade-category-id').val(result.GradeCategory.Name);
            $('#form-edit-grade input[name="gradeCategoryId"]').val(result.GradeCategoryId);

            $('#form-edit-grade input[name="grade"]').val(result.Grade);

            $('#edit-modal').modal('show');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function ShowModalDelete(studentId, subjectId, gradeCatId) {
    // get api grade details
    $.ajax({
        url: `https://localhost:5000/odata/grades?$expand=user,subject,gradecategory&$filter=subjectid eq ${subjectId} and studentId eq '${studentId}' and gradeCategoryId eq ${gradeCatId}`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (grade, status, xhr) {
            // res only 1 record
            var result = grade.value[0];

            // load data
            $('#form-delete-grade input[name="studentId"]').val(result.StudentId);
            $('#delete-student-name').val(result.User.Fullname);

            $('#delete-subject-id').val(result.Subject.Code);
            $('#form-delete-grade input[name="subjectId"]').val(result.SubjectId);

            $('#delete-grade-category-id').val(result.GradeCategory.Name);
            $('#form-delete-grade input[name="gradeCategoryId"]').val(result.GradeCategoryId);

            $('#form-delete-grade input[name="grade"]').val(result.Grade);

            $('#delete-modal').modal('show');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function RenderGrades() {
    table.clear().draw(false);
    $.ajax({
        url: `https://localhost:5000/odata/grades?$expand=User,GradeCategory,Subject&count=true`,
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
                var btnAction = `<div class="d-flex">
                    <button class="btn btn-primary mx-2 btn-sm" onClick="ShowModalEdit('${grade.StudentId}', ${grade.SubjectId}, ${grade.GradeCategoryId});"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="btn btn-danger btn-sm" onClick="ShowModalDelete('${grade.StudentId}', ${grade.SubjectId}, ${grade.GradeCategoryId})"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>`;

                table.row.add([
                    grade.StudentId,
                    grade.Subject.Code,
                    grade.GradeCategory.Name,
                    grade.Grade,
                    ParseDateTime(grade.CreatedOn),
                    ParseDateTime(grade.ModifiedOn),
                    grade.CreatedBy,
                    grade.ModifiedBy,
                    btnAction,
                ]).draw(false);
            });
        }
    });
}

function DownloadTemplate() {
    $.ajax({
        url: 'https://localhost:5000/api/grades/grades-insert-template',
        method: 'GET',
        xhrFields: {
            responseType: 'blob',
        },
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {
            var blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            //Create a download link for the Excel file
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            // Set the file name
            link.download = `template_insert_grades_${Date.now()}.xlsx`;
            link.target = '_blank';

            link.click();
            URL.revokeObjectURL(link);
            link.remove();

            showToastSuccess('Download template successfully!');
        },
        error: function (error) {
            showToastFail(error.status);
        }
    });
}

function ExportGrades() {
    $.ajax({
        url: 'https://localhost:5000/api/grades/export-grades',
        method: 'GET',
        xhrFields: {
            responseType: 'blob',
        },
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {
            var blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            //Create a download link for the Excel file
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            // Set the file name
            link.download = `export_grades_${Date.now()}.xlsx`;
            link.target = '_blank';
            link.click();
            URL.revokeObjectURL(link);
            link.remove();

            showToastSuccess('Export grades successfully!');
        },
        error: function (error) {
            showToastFail(error.status);
        }
    });
}

function ImportGrades(formData) {
    $('#show-error').empty();
    $.ajax({
        url: 'https://localhost:5000/api/grades/import-grades', // Replace with your Web API endpoint URL
        type: 'POST',
        data: formData,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {
            RenderGrades();
            // Handle the successful response
            showToastSuccess('Import grades successfully!');
            $('#modal-import-grades').modal('hide');
        },
        error: function (xhr) {
            var error = xhr.responseJSON;
            if (Array.isArray(error)) {
                var rs = '';
                $.each(error, function (err) {
                    rs += error[err] + "<br/>";
                });
                $('#show-error').html(`${rs}`);
            } else {
                $('#show-error').html(`${error.message}`);
            }
        }
    });
}

