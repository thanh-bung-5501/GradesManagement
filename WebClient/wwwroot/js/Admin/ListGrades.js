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
        url: `https://localhost:5000/odata/User?$expand=role&$filter=Role/Name eq 'student'`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
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

function RenderGrades() {
    table.clear().draw(false);
    $.ajax({
        url: `https://localhost:5000/odata/grades?$expand=User,GradeCategory,Subject&count=true`,
        type: "GET",
        dataType: 'json',
        success: function (listGrades) {
            var grades = listGrades.value;
            // Create view data grades
            $.each(grades, function (index, grade) {
                var btnEditDOM = `<button class="btn btn-primary mx-2 btn-sm" onClick="ShowModalEdit(${grade.StudentId}, ${grade.SubjectId}, ${grade.GradeCategoryId});"><i class="fa-solid fa-pen-to-square"></i> Edit</button>`;
                var btnDeleteDOM = `<button class="btn btn-danger btn-sm" onClick="DeleteProduct(${grade.Id})"><i class="fa-solid fa-trash"></i> Delete</button>`;

                table.row.add([
                    grade.StudentId,
                    grade.Subject.Code,
                    grade.GradeCategory.Name,
                    grade.Grade,
                    ParseDateTime(grade.CreatedOn),
                    ParseDateTime(grade.ModifiedOn),
                    grade.CreatedBy,
                    grade.ModifiedBy,
                    btnEditDOM + btnDeleteDOM,
                ]).draw(false);
            });
        }
    });
}

function DownloadTemplate() {
    console.log("ok");
    $.ajax({
        url: 'https://localhost:5000/api/grades/grades-insert-template',
        method: 'GET',
        xhrFields: {
            responseType: 'blob',
        },
        success: function (response) {
            console.log("t");

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
            //showToastFail(error.status);
            console.log("f");
        }
    });
}
