// Global variables for pagination
var pageSizeRaw = 10;
var currentPageRaw = 1;
var totalItems = 0;
var totalPages = 0;

$(function () {
    RenderSubjects(pageSizeRaw, currentPageRaw);
    RenderPageSize();

    $("#select-page-size").on("change", function () {
        RenderSubjects($("#select-page-size").val(), 1);
    });

    $("#btn-add-subject").on("click", function () {
        ShowModelAdd();
    });

    $("#add-teacher-id").on('change', function () {
        var teacherId = $("#add-teacher-id").val();
        // <div id="add-teacher-details"></div>
        ShowTeacherInfor("#add-teacher-details", teacherId);
    });

    $("#edit-teacher-id").on('change', function () {
        var teacherId = $("#edit-teacher-id").val();
        // <div id="add-teacher-details"></div>
        ShowTeacherInfor("#edit-teacher-details", teacherId);
    });
});

function ShowTeacherInfor(selector, id) {
    //get api teacher details
    $.ajax({
        url: `https://localhost:5000/odata/User('${id}')`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result, status, xhr) {
            $(selector).empty();

            if (result !== undefined) {
                $(selector).append(`(TeacherId: ${result.Id}, Fullname: ${result.Fullname},
                        Email: ${result.Email}, Phone: ${result.Phone}, Address: ${result.Address}).`);
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function ShowModelAdd() {
    $.ajax({
        url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Name eq 'teacher'`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result, status, xhr) {
            // clear items
            $('#add-code').val(null);
            $('#add-name').val(null);
            $('#add-teacher-id').empty();

            //Load select listTeachers
            $.each(result.value, function (index, teacher) {
                $('#add-teacher-id').append(`<option value="${teacher.Id}">${teacher.Fullname}-${teacher.Email}</option>`);
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
        success: function (result, status, xhr) {

            //Load select listTeachers
            $.ajax({
                url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Name eq 'teacher'`,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (teachers, status, xhr) {
                    // clear items
                    $('#edit-teacher-id').empty();

                    //Load select listTeachers
                    $.each(teachers.value, function (index, teacher) {
                        $('#edit-teacher-id').append(`<option value="${teacher.Id}" >${teacher.Id}-${teacher.Fullname}</option>`);
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

function RenderSubjects(pageSize, currentPage) {

    var skipCount = (currentPage - 1) * pageSize;
    var query = "&$top=" + pageSize + "&$skip=" + skipCount;

    $.ajax({
        url: `https://localhost:5000/odata/subject?$expand=user` + query,
        type: "GET",
        dataType: 'json',
        beforeSend: function () {
            $("#loading").addClass("loader");
        },
        success: function (listSubjects) {
            // Create view data users
            $("#table-body").empty();
            $.each(listSubjects.value, function (index, subject) {
                var tbody = $("#table-body");
                var newRow = $("<tr></tr>");
                newRow.append(`<td class="text-truncate">${index + 1 + pageSize * (currentPage - 1)}</td>`);
                newRow.append(`<td class="text-truncate">${subject.Id}</td>`);
                newRow.append(`<td class="text-truncate">${subject.Code}</td>`);
                newRow.append(`<td class="text-truncate">${subject.Name}</td>`);
                var unassignDOM = `<span class="badge bg-danger">Unassigned</span>`;
                newRow.append(`<td class="text-truncate">${subject.TeacherId != null ? subject.TeacherId : unassignDOM}</td>`);
                newRow.append(`<td class="text-truncate">${subject.User != null ? subject.User.Fullname : unassignDOM}</td>`);
                var tdAction = $(`<td class="text-truncate">`);
                tdAction.append(`<button class="btn btn-primary mx-2 btn-sm" onClick="ShowModalEdit(${subject.Id});"><i class="bi bi-pencil-square"></i> Edit</button>`);
                tdAction.append(`<button class="btn btn-danger btn-sm" onClick="DeleteProduct(${subject.Id})"><i class="bi bi-trash"></i> Delete</button>`);
                newRow.append(tdAction);
                tbody.append(newRow);
            });
            RenderPaging(pageSize, currentPage);
        },
        complete: function (data) {
            $("#loading").removeClass("loader");
        }
    });
}

function RenderPaging(pageSize, currentPage) {
    $.ajax({
        url: `https://localhost:5000/odata/subject?$count=true`,
        type: "GET",
        dataType: 'json',
        success: function (listUsers) {
            // get total items
            totalItems = listUsers["@odata.count"];
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
                liPre.append(`<button class="page-link" aria-label="Previous" onClick="RenderSubjects(${pageSize},${currentPage - 1});"><span aria-hidden="true">&laquo;</span></button>`);
                ul.append(liPre);

                // <li> Page DOM
                var liPage = "";
                for (var i = 1; i <= totalPages; i++) {
                    // <li> Active
                    if (i === currentPage) liPage = $(`<li class="page-item active"></li>`);
                    // <li> Inactive
                    else liPage = $(`<li class="page-item"></li>`);
                    // append <li> to <ul>
                    liPage.append(`<button class="page-link" onClick="RenderSubjects(${pageSize},${i});">${i}</button>`);
                    ul.append(liPage);
                }

                // <li> Next DOM
                var liNext = "";
                // <li> disabled
                if (currentPage === totalPages) liNext = $(`<li class="page-item disabled"></li>`);
                // <li> enabled
                else liNext = $(`<li class="page-item"></li>`);
                // append <li> to <ul>
                liNext.append(`<button class="page-link" aria-label="Next" onClick="RenderSubjects(${pageSize},${currentPage + 1});"><span aria-hidden="true">&raquo;</span></button>`);
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

