var token = localStorage.getItem('token');
var table = $('table').DataTable({
    autoWidth: true,
});

$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    Authorize();

    $("#btn-add-subject").on("click", function () {
        ShowModelAdd();
    });

    $('#add-teacher-id').on('select2:select', function (e) {
        $('#add-btn-cancel').empty();
        $('#add-btn-cancel').append(`<button type="button" class="btn-close btn-sm" aria-label="Close"></button>`);
    });

    $("#add-btn-cancel").on('click', function () {
        $("#add-teacher-id").val(null).trigger('change');
        $(this).empty();
    });

    $('#edit-teacher-id').on('select2:select', function (e) {
        $('#edit-btn-cancel').empty();
        $('#edit-btn-cancel').append(`<button type="button" class="btn-close btn-sm" aria-label="Close"></button>`);
    });

    $("#edit-btn-cancel").on('click', function () {
        $("#edit-teacher-id").val(null).trigger('change');
        $(this).empty();
    });
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
            if (response.role === 'Admin') {
                // render subjects view
                RenderSubjects();
            } else {
                window.location.href = "/NotFound";
            }
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

function RenderSubjects() {
    table.clear().draw(false);
    $.ajax({
        url: `https://localhost:5000/odata/subject?$expand=user`,
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
                var btnEditDOM = `<button class="btn btn-primary btn-sm" onClick="ShowModalEdit(${subject.Id});"><i class="fa-solid fa-pen-to-square"></i> Edit</button>`;
                var btnDeleteDOM = `<button class="btn btn-danger mx-2 btn-sm" onClick="DeleteProduct(${subject.Id})"><i class="fa-solid fa-trash"></i> Delete</button>`;
                table.row.add([
                    subject.Id,
                    subject.Code,
                    subject.Name,
                    `${subject.User != null ? subject.User.Fullname : '-'}`,
                    `${subject.User != null ? subject.User.Email : '-'}`,
                    btnEditDOM + btnDeleteDOM,
                ]).draw(false);
            });
        }
    });
}

function ShowModelAdd() {
    $.ajax({
        url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Id eq 2`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (result, status, xhr) {
            // clear items
            $('#add-code').val(null);
            $('#add-name').val(null);
            $('#add-teacher-id').empty();

            $('#add-teacher-id').append(`<optgroup label="TeacherName-TeacherEmail"></optgroup>`);
            //Load select listTeachers
            $.each(result.value, function (index, teacher) {
                $('#add-teacher-id optgroup').append(`<option value="${teacher.Id}">${teacher.Fullname}-${teacher.Email}</option>`);
            });

            //select search
            $('#add-teacher-id').select2({
                theme: "classic",
                minimumResultsForSearch: 1,
                width: 'resolve',
                dropdownParent: $("#add-subject-modal"),
                placeholder: "Select a teacher..."
            });

            // support show Placeholder
            $('#add-teacher-id').val(null).trigger('change');

            // show modal
            $("#add-subject-modal").modal("show");
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function ShowModalEdit(id) {
    $.ajax({
        url: `https://localhost:5000/odata/subject(${id})?$expand=user`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (result, status, xhr) {

            //Load select listTeachers
            $.ajax({
                url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Id eq 2`,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (teachers, status, xhr) {
                    // clear items
                    $('#edit-teacher-id').empty();

                    $('#edit-teacher-id').append(`<optgroup label="TeacherName-TeacherEmail"></optgroup>`)
                    //Load select listTeachers
                    $.each(teachers.value, function (index, teacher) {
                        $('#edit-teacher-id optgroup').append(`<option value="${teacher.Id}">${teacher.Fullname}-${teacher.Email}</option>`);
                    });

                    //select search
                    $('#edit-teacher-id').select2({
                        theme: "classic",
                        minimumResultsForSearch: 1,
                        width: 'resolve',
                        dropdownParent: $("#edit-subject-modal")
                    });

                    //Load detail subject
                    $('#edit-id').val(result.Id);
                    $('#edit-code').val(result.Code);
                    $('#edit-name').val(result.Name);

                    // support load data .trigger('change')
                    $('#edit-teacher-id').val(result.TeacherId).trigger('change');

                    $('#edit-btn-cancel').empty();
                    if (result.TeacherId) {
                        $('#edit-btn-cancel').append(`<button type="button" class="btn-close btn-sm" aria-label="Close"></button>`);
                    }
                },
                error: function (xhr, status, error) {
                    console.log(xhr);
                }
            });
            $('#edit-subject-modal').modal('show');

        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function CheckNullInput(selector, error) {
    if ($(selector).val().length === 0) {
        $(selector).siblings('.text-danger').text(error);
    } else {
        $(selector).siblings('.text-danger').text('');
    }
}

function ModalAddSumibtForm() {
    // Validation Input
    CheckNullInput("#add-code", 'Code must be not null or empty');
    CheckNullInput("#add-name", 'SubjectName must be not null or empty');

    var hasError = false;
    $('span.text-danger.small').each(function () {
        if ($(this).text().trim() !== '') {
            hasError = true;
            return;
        }
    });

    if (hasError === false) {
        var data_subject = {
            code: $("#add-code").val(),
            name: $("#add-name").val(),
            teacherId: $("#add-teacher-id option:selected").length > 0 ? $("#add-teacher-id").val() : null,
        };

        $.ajax({
            url: "https://localhost:5000/odata/subject",
            type: "POST",
            data: JSON.stringify(data_subject),
            contentType: "application/json",
            beforeSend: function (xhr) {
                // Set the Bearer token in the Authorization header
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function (response) {
                // add new row datatable
                RenderSubjects();

                // hide modal add
                $("#add-subject-modal").modal("hide");
                showToastSuccess(`Add subject(${data_subject.code}) successfully!`);
            },
            error: function (error) {
                showToastFail(error.responseText);
            }
        });
    }
}

function ModalEditSubmitForm() {
    var data_subject = {
        id: $('#edit-id').val(),
        code: $("#edit-code").val(),
        name: $("#edit-name").val(),
        teacherId: $("#edit-teacher-id option:selected").length > 0 ? $("#edit-teacher-id").val() : null,
    };

    $.ajax({
        url: `https://localhost:5000/odata/subject(${data_subject.id})`,
        type: "PUT",
        data: JSON.stringify(data_subject),
        contentType: "application/json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            // edit row datatable
            RenderSubjects();

            // hide modal edit
            $("#edit-subject-modal").modal("hide");
            showToastSuccess(`Edit subject(${data_subject.code}) successfully!`);
        },
        error: function (error) {
            showToastFail(error.responseText);
        }
    });
}