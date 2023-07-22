var table = $('table').DataTable({
    autoWidth: true,
});

$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    // render students view
    RenderStudents();
});

function RenderStudents() {
    table.clear().draw(false);
    $.ajax({
        url: `https://localhost:5000/odata/User?$expand=role&$filter=RoleId eq 3 and Status eq 1`,
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
                var status = `<span class="dot bg-success"></span>Active`;

                table.row.add([
                    user.Id,
                    user.Fullname,
                    user.Email,
                    user.Phone,
                    user.Address,
                    status
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