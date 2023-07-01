// Global variables for pagination
var pageSizeRaw = 10;
var currentPageRaw = 1;
var totalItems = 0;
var totalPages = 0;

$(function () {
    RenderUsers(pageSizeRaw, currentPageRaw);
    RenderPageSize();

    $("#select-page-size").on("change", function () {
        RenderUsers($("#select-page-size").val(), 1);
    });

    EyePasswordHandle();

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

        // show modal
        $("#add-user-modal").modal("show");
    });
});

function EyePasswordHandle() {
    $("#eye-password").on("click", function () {
        var fieldType = $('#add-upw').attr('type');
        if (fieldType === 'text') {
            $('#add-upw').attr('type', 'password');
        } else if (fieldType === 'password') {
            $('#add-upw').attr('type', 'text');
        }
    });

    $("#confirm-eye-password").on("click", function () {
        var fieldType = $('#confirm-upw').attr('type');
        if (fieldType === 'text') {
            $('#confirm-upw').attr('type', 'password');
        } else if (fieldType === 'password') {
            $('#confirm-upw').attr('type', 'text');
        }
    });

    $("#edit-eye-password").on("click", function () {
        var fieldType = $('#edit-upw').attr('type');
        if (fieldType === 'text') {
            $('#edit-upw').attr('type', 'password');
        } else if (fieldType === 'password') {
            $('#edit-upw').attr('type', 'text');
        }
    });
}

function RenderUsers(pageSize, currentPage) {

    var skipCount = (currentPage - 1) * pageSize;
    var query = "&$top=" + pageSize + "&$skip=" + skipCount;

    $.ajax({
        url: `https://localhost:5000/odata/User?$expand=Role` + query,
        type: "GET",
        dataType: 'json',
        beforeSend: function () {
            $("#loading").addClass("loader");
        },
        success: function (listUsers) {

            // Create view data users
            $("#table-body").empty();
            $.each(listUsers.value, function (index, user) {
                var tbody = $("#table-body");
                var newRow = $("<tr></tr>");
                newRow.append(`<td class="text-truncate">${index + 1 + pageSize * (currentPage - 1)}</td>`);
                newRow.append(`<td class="text-truncate">${user.Id}</td>`);
                newRow.append(`<td class="text-truncate">${user.Fullname}</td>`);
                newRow.append(`<td class="text-truncate">${user.Email}</td>`);
                newRow.append(`<td class="text-truncate">${user.Phone}</td>`);
                newRow.append(`<td class="text-truncate">${user.Address}</td>`);
                newRow.append(`<td class="text-truncate">${user.Role.Name}</td>`);
                var userStatus = user.Status;
                // status = 1 => active
                if (userStatus === 1) {
                    newRow.append(`<td class="text-truncate"><span class="badge bg-success">active</span></td>`);
                } else if (userStatus === 0) {
                    // staus = 0 => block
                    newRow.append(`<td class="text-truncate"><span class="badge bg-danger">block</span></td>`);
                }
                var tdAction = $(`<td class="text-truncate">`);
                tdAction.append(`<button class="btn btn-primary btn-sm" onClick="ShowModalEdit(${user.Id});"><i class="bi bi-pencil-square"></i> Edit</button>`);
                tdAction.append(`<button class="btn btn-danger mx-2 btn-sm" onClick="DeleteProduct(${user.Id})"><i class="bi bi-trash"></i> Delete</button>`);
                newRow.append(tdAction);
                tbody.append(newRow);
            });

            // show paging
            RenderPaging(pageSize, currentPage);
        },
        complete: function (data) {
            $("#loading").removeClass("loader");
        }
    });
}

function RenderPaging(pageSize, currentPage) {
    $.ajax({
        url: `https://localhost:5000/odata/User?$count=true`,
        type: "GET",
        dataType: 'json',
        success: function (listUsers) {
            totalItems = listUsers["@odata.count"];
            totalPages = totalItems % pageSize === 0 ? totalItems / pageSize : Math.floor(totalItems / pageSize + 1);
            // clear Paging DOM
            $(".pagination").empty();

            // pageSize >= totalItems => Empty Paging DOM
            if (pageSize < totalItems) {
                var ul = $(".pagination");
                // <li> Previoue DOM
                var liPre = "";
                if (currentPage === 1) {
                    // <li> disabled
                    liPre = $(`<li class="page-item disabled"></li>`);
                } else {
                    // <li> enabled
                    liPre = $(`<li class="page-item"></li>`);
                }
                liPre.append(`<button class="page-link" aria-label="Previous" onClick="RenderUsers(${pageSize},${currentPage - 1});"><span aria-hidden="true">&laquo;</span></button>`);
                ul.append(liPre);

                // <li> Page DOM
                for (var i = 1; i <= totalPages; i++) {
                    if (i === currentPage) {
                        // <li> Active
                        ul.append(`<li class="page-item active"><button class="page-link" onClick="RenderUsers(${pageSize},${i});">${i}</button></li>`);
                    } else {
                        // <li> Inactive
                        ul.append(`<li class="page-item"><button class="page-link" onClick="RenderUsers(${pageSize},${i});">${i}</button></li>`);
                    }
                }

                // <li> Next DOM
                var liNext = "";
                if (currentPage === totalPages) {
                    // <li> disabled
                    liNext = $(`<li class="page-item disabled"></li>`);
                } else {
                    // <li> enabled
                    liNext = $(`<li class="page-item"></li>`);
                }
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
            $('#edit-id').val(result.Id);
            $('#edit-uname').val(result.Fullname);
            $('#edit-uemail').val(result.Email);
            $('#edit-upw').val(result.Password);
            $('#edit-uphone').val(result.Phone);
            $('#edit-uaddress').val(result.Address);
            $('#edit-urole').val(result.RoleId);
            $('#edit-ustatus').val(result.Status);

            $('#edit-user-modal').modal('show');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}
