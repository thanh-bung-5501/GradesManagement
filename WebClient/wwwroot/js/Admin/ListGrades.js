// Global variables for pagination
var pageSizeRaw = 10, currentPageRaw = 1, totalItems = 0, totalPages = 0;

$(function () {
    // load data grade
    RenderGrades(pageSizeRaw, currentPageRaw);
    // load page size
    RenderPageSize();

    $("#btn-add-grade").on("click", function () {
        ShowModelAdd();
    });

    $("#add-student-id").on('change', function () {
        var studentId = $("#add-student-id").val();
        // <div id="add-student-details"></div>
        ShowStudentInfor("#add-student-details", studentId);
    });

    $("#add-subject-id").on('change', function () {
        var subjectId = $("#add-subject-id").val();
        // <div id="add-student-details"></div>
        ShowSubjectInfor("#add-subject-details", subjectId);
    });
});

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

function ShowStudentInfor(selector, id) {
    $(selector).empty();
    //get api student details
    $.ajax({
        url: `https://localhost:5000/odata/User('${id}')`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result, status, xhr) {
            if (result !== undefined) {
                $(selector).append(`(StudentId: ${result.Id}, Fullname: ${result.Fullname},
                        Email: ${result.Email}, Phone: ${result.Phone}, Address: ${result.Address}).`);
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function ShowSubjectInfor(selector, id) {
    $(selector).empty();
    if (id) {
        //get api subject details
        $.ajax({
            url: `https://localhost:5000/odata/subject(${id})`,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result, status, xhr) {
                if (result !== undefined) {
                    $(selector).append(`(SubjectId: ${result.Id}, Code: ${result.Code},
                        Name: ${result.Name})`);
                }
            },
            error: function (xhr, status, error) {
                console.log(xhr);
            }
        });
    }
}

function LoadSelectSearchStudent(selectorSelectSearch, selectorModal, value) {
    $.ajax({
        url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Name eq 'student'`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result, status, xhr) {
            $(selectorSelectSearch).append(`<optgroup label="StudentName-StudentEmail"></optgroup>`);

            $.each(result.value, function (index, student) {
                $(`${selectorSelectSearch} optgroup`).append(`<option value="${student.Id}">${student.Fullname}-${student.Email}</option>`);
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
        success: function (result, status, xhr) {
            $(selectorSelectSearch).append(`<optgroup label="SubjectCode-SubjectName"></optgroup>`);
            $.each(result.value, function (index, subject) {
                $(selectorSelectSearch).append(`<option value="${subject.Id}">${subject.Code}-${subject.Name}</option>`);

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
        success: function (result, status, xhr) {
            $(selectorSelectSearch).append(`<optgroup label="GradeCategoryName"></optgroup>`);
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
        url: `https://localhost:5000/odata/grades?$expand=user&$filter=subjectid eq ${subjectId} and studentId eq '${studentId}' and GradeCategoryId eq ${gradeCatId}`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (grade, status, xhr) {
            // res only 1 record
            var result = grade.value[0];

            // load select search student
            LoadSelectSearchStudent('#edit-student-id', '#edit-modal', result.StudentId);

            // load select search subject
            LoadSelecSearchSubject('#edit-subject-id', '#edit-modal', result.SubjectId);

            // load select search grade category
            LoadSelectSearchGradeCategory('#edit-grade-category-id', '#edit-modal', result.GradeCategoryId);

            // load grade
            $('#edit-grade').val(result.Grade);

            $('#edit-modal').modal('show');
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    });
}

function RenderGrades(pageSize, currentPage) {
    var skipCount = (currentPage - 1) * pageSize;
    var query = "&$top=" + pageSize + "&$skip=" + skipCount;

    $.ajax({
        url: `https://localhost:5000/odata/grades?$expand=User,GradeCategory,Subject&count=true` + query,
        type: "GET",
        dataType: 'json',
        beforeSend: function () {
            $("#loading").addClass("loader");
        },
        success: function (listGrades) {
            // Create view data users
            $("#table-body").empty();
            $.each(listGrades.value, function (index, grade) {
                var tbody = $("#table-body");
                var newRow = $("<tr></tr>");
                newRow.append(`<td class="text-truncate">${index + 1 + pageSize * (currentPage - 1)}</td>`);
                newRow.append(`<td class="text-truncate">${grade.StudentId}</td>`);
                newRow.append(`<td class="text-truncate">${grade.Subject.Code}</td>`);
                newRow.append(`<td class="text-truncate">${grade.GradeCategory.Name}</td>`);
                newRow.append(`<td class="text-truncate">${grade.Grade}</td>`);
                newRow.append(`<td class="text-truncate">${ParseDateTime(grade.CreatedOn)}</td>`);
                newRow.append(`<td class="text-truncate">${ParseDateTime(grade.ModifiedOn)}</td>`);
                newRow.append(`<td class="text-truncate">${grade.CreatedBy}</td>`);
                newRow.append(`<td class="text-truncate">${grade.ModifiedBy}</td>`);
                var tdAction = $(`<td class="text-truncate">`);
                tdAction.append(`<button class="btn btn-primary mx-2 btn-sm" onClick="ShowModalEdit(${grade.StudentId}, ${grade.SubjectId}, ${grade.GradeCategoryId});"><i class="bi bi-pencil-square"></i> Edit</button>`);
                tdAction.append(`<button class="btn btn-danger btn-sm" onClick="DeleteProduct(${grade.Id})"><i class="bi bi-trash"></i> Delete</button>`);
                newRow.append(tdAction);
                tbody.append(newRow);
            });
            // load paging
            RenderPaging(pageSize, currentPage);
        },
        complete: function (data) {
            $("#loading").removeClass("loader");
        }
    });
}

function RenderPaging(pageSize, currentPage) {
    $.ajax({
        url: `https://localhost:5000/odata/grades?$expand=User,GradeCategory,Subject&count=true`,
        type: "GET",
        dataType: 'json',
        success: function (listGrades) {
            // get total items
            totalItems = listGrades["@odata.count"];
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
                liPre.append(`<button class="page-link" aria-label="Previous" onClick="RenderGrades(${pageSize},${currentPage - 1});"><span aria-hidden="true">&laquo;</span></button>`);
                ul.append(liPre);

                // <li> Page DOM
                var liPage = "";
                for (var i = 1; i <= totalPages; i++) {
                    // <li> Active
                    if (i === currentPage) liPage = $(`<li class="page-item active"></li>`);
                    // <li> Inactive
                    else liPage = $(`<li class="page-item"></li>`);
                    // append <li> to <ul>
                    liPage.append(`<button class="page-link" onClick="RenderGrades(${pageSize},${i});">${i}</button>`);
                    ul.append(liPage);
                }

                // <li> Next DOM
                var liNext = "";
                // <li> disabled
                if (currentPage === totalPages) liNext = $(`<li class="page-item disabled"></li>`);
                // <li> enabled
                else liNext = $(`<li class="page-item"></li>`);
                // append <li> to <ul>
                liNext.append(`<button class="page-link" aria-label="Next" onClick="RenderGrades(${pageSize},${currentPage + 1});"><span aria-hidden="true">&raquo;</span></button>`);
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
