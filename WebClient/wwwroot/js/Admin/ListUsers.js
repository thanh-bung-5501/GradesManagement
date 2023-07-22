var token = localStorage.getItem('token');

var table = $('table').DataTable({
    autoWidth: true,
});

$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    // render users view
    RenderUsers();

    // catch events input password
    EyePasswordEvent();

    // click btn add event
    $("#btn-add-user").on("click", function () {
        // clear items
        $('#add-uname').val(null);
        $('#add-uemail').val(null);
        $('#add-upw').val(null);
        $('#confirm-upw').val(null);
        $('#add-uphone').val(null);
        $('#add-uaddress').val(null);
        $('#add-urole').val(2);
        $('#add-ustatus').val(1);
        $('#add-upw').attr('type', 'password');
        $('#confirm-upw').attr('type', 'password');
        $('span.text-danger.small').empty();
        // show modal
        $("#add-user-modal").modal("show");
    });

    $('#export-users').on('click', function () {
        ExportUsers();
    });

    $('#download-template').on('click', function () {
        DownloadTemplate();
    });

    $('#btn-import-users').on('click', function () {
        $('#input-file').val(null);
        $('#show-error').empty();
        $('#modal-import-users').modal('show');
    });

    $('#input-file').on('change', function () {
        $('#show-error').empty();
    });

    $('#form-import-users').on('submit', function (event) {
        event.preventDefault();
        var formData = new FormData($('#form-import-users')[0]);
        ImportUsers(formData);
    });
});

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

function ImportUsers(formData) {
    $('#show-error').empty();
    $.ajax({
        url: 'https://localhost:5000/api/user/import-users', // Replace with your Web API endpoint URL
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
            RenderUsers();
            // Handle the successful response
            showToastSuccess('Import users successfully!');
            $('#modal-import-users').modal('hide');
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

function ExportUsers() {
    $.ajax({
        url: 'https://localhost:5000/api/user/export-users',
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
            link.download = `export_users_${Date.now()}.xlsx`;
            link.target = '_blank';
            link.click();
            URL.revokeObjectURL(link);
            link.remove();

            showToastSuccess('Export users successfully!');
        },
        error: function (error) {
            showToastFail(error.status);
        }
    });
}

function DownloadTemplate() {
    $.ajax({
        url: 'https://localhost:5000/api/user/users-insert-template',
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
            link.download = `template_insert_users_${Date.now()}.xlsx`;
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

function EyePasswordHandle(selector) {
    var fieldType = $(selector).attr('type');
    if (fieldType === 'text') {
        $(selector).attr('type', 'password');
    } else if (fieldType === 'password') {
        $(selector).attr('type', 'text');
    }
}

function EyePasswordEvent() {
    $("#eye-password").on("click", function () {
        EyePasswordHandle('#add-upw');
    });
    $("#confirm-eye-password").on("click", function () {
        EyePasswordHandle('#confirm-upw');
    });
    $("#edit-eye-password").on("click", function () {
        EyePasswordHandle('#edit-upw');
    });
}

function RenderUsers() {
    table.clear().draw(false);

    $.ajax({
        url: `https://localhost:5000/odata/User?&$expand=Role`,
        type: "GET",
        dataType: 'json',
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (listUsers) {
            var users = listUsers.value;
            // Create view data users
            $.each(users, function (index, user) {
                var status = '';
                var btnEditDOM = `<button class="btn btn-primary btn-sm" onClick="ShowModalEdit('${user.Id}');"><i class="fa-solid fa-pen-to-square"></i> Edit</button>`;
                var btnDeleteDOM = `<button class="btn btn-danger mx-2 btn-sm" onClick="DeleteProduct(${user.Id})"><i class="fa-solid fa-trash"></i> Delete</button>`;

                // status = 1 => active
                if (user.Status === 1) status = `<span class="dot bg-success"></span>Active`;
                // staus = 0 => block
                else if (user.Status === 0) status = `<span class="dot bg-danger"></span>Block`;

                table.row.add([
                    user.Id,
                    user.Fullname,
                    user.Email,
                    user.Phone,
                    user.Address,
                    user.Role.Name,
                    status,
                    btnEditDOM + btnDeleteDOM,
                ]).draw(false);
            });
        },
        error: function (xhr) {
            if (xhr.status === 401 || xhr.status === 403) {
                window.location.href = "/NotFound";
            } else {
                showToastFail(xhr.responseText);
            }
        }
    });
}

function ShowModalEdit(id) {
    $.ajax({
        url: `https://localhost:5000/odata/User('${id}')`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (result, status, xhr) {
            // set data to view
            $('#edit-id').val(result.Id);
            $('#edit-uname').val(result.Fullname);
            $('#edit-uemail').val(result.Email);
            $('#edit-upw').val(result.Password);
            $('#edit-uphone').val(result.Phone);
            $('#edit-uaddress').val(result.Address);
            $('#edit-urole').val(result.RoleId);
            $('#edit-ustatus').val(result.Status);
            // show modal
            $('#edit-user-modal').modal('show');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function CheckNullInput(selector, error) {
    if ($(selector).val().length === 0) {
        if (selector === '#add-upw') {
            $(selector).parent().siblings('.text-danger').text(error);
        } else if (selector === '#confirm-upw') {
            $(selector).parent().siblings('.text-danger').text(error);
        } else {
            $(selector).siblings('.text-danger').text(error);
        }
    } else {
        if (selector === '#add-upw') {
            $(selector).parent().siblings('.text-danger').text('');
        } else if (selector === '#confirm-upw') {
            $(selector).parent().siblings('.text-danger').text('');
        } else {
            $(selector).siblings('.text-danger').text('');
        }
    }
}

function CheckMatchPw(selector1, selector2) {
    if ($(selector1).val() !== $(selector2).val()) {
        $(selector2).parent().siblings('.text-danger').text('Confirm password does not match to password');
    } else {
        $(selector2).parent().siblings('.text-danger').text('');
    }
}

function ModalAddSubmitForm() {
    // Validation Input
    CheckNullInput("#add-uname", 'Full name must be not null or empty');
    CheckNullInput("#add-uemail", 'Email must be not null or empty');
    CheckNullInput("#add-upw", 'Password must be not null or empty');
    CheckNullInput("#confirm-upw", 'Confirm password must be not null or empty');
    CheckMatchPw("#add-upw", "#confirm-upw");
    CheckNullInput("#add-uphone", 'Phone must be not null or empty');
    CheckNullInput("#add-uaddress", 'Address must be not null or empty');

    var hasError = false;
    $('span.text-danger.small').each(function () {
        if ($(this).text().trim() !== '') {
            hasError = true;
            return;
        }
    });

    if (hasError === false) {
        var data_user = {
            fullname: $("#add-uname").val(),
            email: $("#add-uemail").val(),
            password: $("#add-upw").val(),
            phone: $("#add-uphone").val(),
            address: $("#add-uaddress").val(),
            roleId: $("#add-urole").val(),
            status: $("#add-ustatus").val()
        };

        $.ajax({
            url: "https://localhost:5000/odata/user",
            type: "POST",
            data: JSON.stringify(data_user),
            contentType: "application/json",
            beforeSend: function (xhr) {
                // Set the Bearer token in the Authorization header
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
            },
            success: function (response) {
                // add new row datatable
                RenderUsers();
                // hide modal add
                $("#add-user-modal").modal("hide");
                showToastSuccess(`Add user(${data_user.fullname}) successfully!`);
            },
            error: function (error) {
                showToastFail(error.responseText);
            }
        });
    }
}

function ModalEditSubmitForm() {
    var data_user = {
        id: $('#edit-id').val(),
        fullname: $("#edit-uname").val(),
        email: $("#edit-uemail").val(),
        password: $("#edit-upw").val(),
        phone: $("#edit-uphone").val(),
        address: $("#edit-uaddress").val(),
        roleId: $("#edit-urole").val(),
        status: $("#edit-ustatus").val()
    };

    $.ajax({
        url: `https://localhost:5000/odata/user('${data_user.id}')`,
        type: "PUT",
        data: JSON.stringify(data_user),
        contentType: "application/json",
        beforeSend: function (xhr) {
            // Set the Bearer token in the Authorization header
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
        },
        success: function (response) {
            // edit row datatable
            RenderUsers();
            // hide modal add
            $("#edit-user-modal").modal("hide");
            showToastSuccess(`Edit user(${data_user.fullname}) successfully!`);
        },
        error: function (error) {
            console.error("Request failed. Error:", error);
        }
    });
}