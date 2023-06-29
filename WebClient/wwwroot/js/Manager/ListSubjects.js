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
        /*
         * Load select listTeachers
         */

        $.ajax({
            url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Name eq 'teacher'`,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result, status, xhr) {
                $('#add-teacher-id').empty();
                $.each(result.value, function (index, teacher) {
                    $('#add-teacher-id').append(`<option value="${teacher.Id}" >${teacher.Fullname}</option>`);
                });

                $('#add-teacher-id').selectize({
                    sortField: 'text'
                });

                $("#add-subject-modal").modal("show");
            },
            error: function (xhr, status, error) {
                console.log(xhr);
            }
        });
    });

    $("#add-teacher-id").on('change', function () {

        // div #teacher details
        var teacherId = $("#add-teacher-id").val();

        //get api teacher details
        $.ajax({
            url: `https://localhost:5000/odata/User('${teacherId}')`,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result, status, xhr) {
                $("#teacher-details").empty();

                console.log(result);

                $("#teacher-details").append(`<b>Teacher Information:</b><br/>`)
                $("#teacher-details").append(`TeacherId: ${result.Id} <br/> `);
                $("#teacher-details").append(`Fullname: ${result.Fullname} <br/>`);
                $("#teacher-details").append(`Email: ${result.Email} <br/>`);
                $("#teacher-details").append(`Phone: ${result.Phone} <br/>`);
                $("#teacher-details").append(`Address: ${result.Address} <br/>`);

            },
            error: function (xhr, status, error) {
                console.log(xhr);
            }
        });
    });
});


function RenderSubjects(pageSize, currentPage) {

    var skipCount = (currentPage - 1) * pageSize;
    var query = "&$top=" + pageSize + "&$skip=" + skipCount;

    $.ajax({
        url: `https://localhost:5000/odata/subject?$expand=user` + query,
        type: "GET",
        dataType: 'json',
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
                tdAction.append(`<button class="btn btn-primary btn-sm"><i class="bi bi-person-lines-fill"></i> List grades students</button>`);
                tdAction.append(`<button class="btn btn-primary mx-2 btn-sm" onClick="ShowModalEdit(${subject.Id});"><i class="bi bi-pencil-square"></i> Edit</button>`);
                tdAction.append(`<button class="btn btn-danger btn-sm" onClick="DeleteProduct(${subject.Id})"><i class="bi bi-trash"></i> Delete</button>`);
                newRow.append(tdAction);
                tbody.append(newRow);
            });

            RenderPaging(pageSize, currentPage);
        }
    });
}

function RenderPaging(pageSize, currentPage) {
    $.ajax({
        url: `https://localhost:5000/odata/subject?$count=true`,
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
                liPre.append(`<button class="page-link" aria-label="Previous" onClick="RenderSubjects(${pageSize},${currentPage - 1});"><span aria-hidden="true">&laquo;</span></button>`);
                ul.append(liPre);

                // <li> Page DOM
                for (var i = 1; i <= totalPages; i++) {
                    if (i === currentPage) {
                        // <li> Active
                        ul.append(`<li class="page-item active"><button class="page-link" onClick="RenderSubjects(${pageSize},${i});">${i}</button></li>`);
                    } else {
                        // <li> Inactive
                        ul.append(`<li class="page-item"><button class="page-link" onClick="RenderSubjects(${pageSize},${i});">${i}</button></li>`);
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

