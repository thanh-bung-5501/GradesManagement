// Global variables for pagination
var pageSizeRaw = 10, currentPageRaw = 1, totalItems = 0, totalPages = 0;

$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    // render users view
    RenderUsers(pageSizeRaw, currentPageRaw);

    // catch events input password
    EyePasswordEvent();

    // select page size event
    $("#select-page-size").on("change", function () {
        RenderUsers($("#select-page-size").val(), 1);
    });

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
        $('span.text-danger.small').empty();
        // show modal
        $("#add-user-modal").modal("show");
    });

    $('#btn-search').on('click', function () {
        RenderUsers($('#select-page-size').val(), 1);
    });

    $('#export-users').on('click', function () {
        ExportUsers();
    });

    $('#download-template').on('click', function () {
        DownloadTemplate();
    });

    $('#btn-import-users').on('click', function () {
        $('#formFileSm').val(null);
        $('#show-error').empty();
        $('#modal-import-users').modal('show');
    });

    $('#formFileSm').on('change', function () {
        $('#show-error').empty();
    });

    $('#form-import-users').on('submit', function (event) {
        event.preventDefault();
        var formData = new FormData($('#form-import-users')[0]);
        ImportUsers(formData);
    });

    // render page size view
    RenderPageSize();
});

function ImportUsers(formData) {
    $('#show-error').empty();
    $.ajax({
        url: 'https://localhost:5000/api/user/import-users', // Replace with your Web API endpoint URL
        type: 'POST',
        data: formData,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        success: function (response) {
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
            <span class="bi bi-check-circle-fill"></span>
            <strong class="me-auto">Success</strong>
        `);

        toastBody.empty();
        toastBody.html(body);
    } else if (type === 'error') {
        toastTitle.empty();
        toastTitle.removeClass();
        toastTitle.addClass('text-danger');
        toastTitle.html(`
            <span class="bi bi-x-circle-fill"></span>
            <strong class="me-auto">Error</strong>
        `);

        toastBody.empty();
        toastBody.html(body);
    }
    toastBootstrap.show();
}

function ExportUsers() {
    $.ajax({
        url: 'https://localhost:5000/api/user/export-users',
        method: 'GET',
        xhrFields: {
            responseType: 'blob',
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

function RenderUsers(pageSize, currentPage) {
    // paging
    var skipCount = (currentPage - 1) * pageSize;
    var query = "&$top=" + pageSize + "&$skip=" + skipCount;

    // filter select
    var filter = '&$filter=';
    var search = $('#search').val();
    var selectRole = $('#select-role').val();
    var selectStatus = $('#select-status').val();

    // if have search
    if (search !== '') {
        filter += `(contains(id,'${search}') or contains(fullname, '${search}') or contains(email,'${search}') or contains(phone, '${search}') or contains(address, '${search}'))`;
    }

    // if not select all
    if (selectRole !== '') {
        // if last index filter is '='
        if (filter.slice(-1) === '=') {
            filter += `roleid eq ${selectRole}`;

        } else {
            // if last index filter not '='
            filter += ` and roleid eq ${selectRole}`
        }
    }

    // if not select all
    if (selectStatus !== '') {
        // if last index filter is '='
        if (filter.slice(-1) === '=') {
            filter += `status eq ${selectStatus}`;
        } else {
            // if last index filter not '='
            filter += ` and status eq ${selectStatus}`
        }
    }

    // if have filter
    if (filter !== '&$filter=') query += filter;

    $.ajax({
        url: `https://localhost:5000/odata/User?&$expand=Role` + query,
        type: "GET",
        dataType: 'json',
        success: function (listUsers) {
            // Create view data users
            $("#table-body").empty();
            $.each(listUsers.value, function (index, user) {
                var tbody = $("#table-body");
                var newRow = $("<tr></tr>");
                newRow.append(`<td class="text-truncate text-wrap">${index + 1 + pageSize * (currentPage - 1)}</td>`);
                newRow.append(`<td class="text-truncate text-wrap">${user.Id}</td>`);
                newRow.append(`<td class="text-truncate text-wrap">${user.Fullname}</td>`);
                newRow.append(`<td class="text-truncate text-wrap">${user.Email}</td>`);
                newRow.append(`<td class="text-truncate text-wrap">${user.Phone}</td>`);
                newRow.append(`<td class="text-truncate text-wrap">${user.Address}</td>`);
                newRow.append(`<td class="text-truncate text-wrap">${user.Role.Name}</td>`);
                var userStatus = user.Status;
                // status = 1 => active
                if (userStatus === 1) {
                    newRow.append(`<td class="text-truncate"><span class="dot bg-success"></span>active</td>`);
                } else if (userStatus === 0) {
                    // staus = 0 => block
                    newRow.append(`<td class="text-truncate"><span class="dot bg-danger"></span>block</td>`);
                }
                var tdAction = $(`<td class="text-truncate">`);
                tdAction.append(`<button class="btn btn-primary btn-sm" onClick="ShowModalEdit('${user.Id}');"><i class="bi bi-pencil-square"></i> Edit</button>`);
                tdAction.append(`<button class="btn btn-danger mx-2 btn-sm" onClick="DeleteProduct(${user.Id})"><i class="bi bi-trash"></i> Delete</button>`);
                newRow.append(tdAction);
                tbody.append(newRow);
            });

            // show paging
            RenderPaging(pageSize, currentPage, filter);
        }
    });
}

function RenderPaging(pageSize, currentPage, filter) {
    var url = 'https://localhost:5000/odata/User?$count=true';
    // if have filter
    if (filter !== '&$filter=') url += filter;

    $.ajax({
        url: url,
        type: "GET",
        dataType: 'json',
        success: function (listUsers) {
            // get total items
            totalItems = listUsers["@odata.count"];

            // no result found
            if (totalItems === 0) {
                $('#table').attr("hidden", true);
                $('#page-size').hide();
                $('#show-result').html(`<i>No result found!</i>`);
            } else {
                $('#table').attr("hidden", false);
                $('#page-size').show();
                $('#show-result').html(``);
            }

            // get total pages
            totalPages = totalItems % pageSize === 0 ? totalItems / pageSize : Math.floor(totalItems / pageSize + 1);
            // clear Paging DOM
            $(".pagination").empty();

            // pageSize >= totalItems => Empty Paging DOM
            if (pageSize < totalItems) {
                var ul = $(".pagination");
                // <li> Previoue DOM
                var liPre = "";
                // <li> disabled
                if (currentPage === 1) liPre = $(`<li class="page-item disabled"></li>`);
                // <li> enabled
                else liPre = $(`<li class="page-item"></li>`);
                // append <li> to <ul>
                liPre.append(`<button class="page-link" aria-label="Previous" onClick="RenderUsers(${pageSize},${currentPage - 1});"><span aria-hidden="true">&laquo;</span></button>`);
                ul.append(liPre);

                // <li> Page DOM
                var liPage = "";
                for (var i = 1; i <= totalPages; i++) {
                    // <li> Active
                    if (i === currentPage) liPage = $(`<li class="page-item active"></li>`);
                    // <li> Inactive
                    else liPage = $(`<li class="page-item"></li>`);
                    // append <li> to <ul>
                    liPage.append(`<button class="page-link" onClick="RenderUsers(${pageSize},${i});">${i}</button>`);
                    ul.append(liPage);
                }

                // <li> Next DOM
                var liNext = "";
                // <li> disabled
                if (currentPage === totalPages) liNext = $(`<li class="page-item disabled"></li>`);
                // <li> enabled
                else liNext = $(`<li class="page-item"></li>`);
                // append <li> to <ul>
                liNext.append(`<button class="page-link" aria-label="Next" onClick="RenderUsers(${pageSize},${currentPage + 1});"><span aria-hidden="true">&raquo;</span></button>`);
                ul.append(liNext);
            }
        }
    });
}

function RenderPageSize() {
    $("#select-optgroup").empty();
    $("#select-optgroup").append(`<option>5</option>`);
    $("#select-optgroup").append(`<option selected>10</option>`);
    $("#select-optgroup").append(`<option>20</option>`);
}

function ShowModalEdit(id) {
    $.ajax({
        url: `https://localhost:5000/odata/User('${id}')`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
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
    CheckNullInput("#add-uname", 'Full name must be not null');
    CheckNullInput("#add-uemail", 'Email must be not null');
    CheckNullInput("#add-upw", 'Password must be not null');
    CheckNullInput("#confirm-upw", 'Confirm password must be not null');
    CheckMatchPw("#add-upw", "#confirm-upw");
    CheckNullInput("#add-uphone", 'Phone must be not null');
    CheckNullInput("#add-uaddress", 'Address must be not null');

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
            success: function (response) {
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