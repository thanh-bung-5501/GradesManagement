$(document).on({
    ajaxStart: function () { $("body").addClass("loading"); },
    ajaxStop: function () { $("body").removeClass("loading"); }
});

$(function () {
    $('#form').on('submit', function () {
        $('#show-error').html('');
        event.preventDefault();

        // Get user credentials from the form
        var email = $('input[name="email"]').val();
        var password = $('input[name="password"]').val();

        localStorage.clear();
        //Sending the AJAX request
        $.ajax({
            url: 'https://localhost:5000/api/Authenticate/login',
            type: 'POST',
            data: JSON.stringify({ email: email, password: password }),
            contentType: 'application/json', // Set the Content-Type header
            success: function (response) {
                // If login is successful, response should contain the JWT token
                var jwtToken = response.token;

                // Store the JWT token securely (e.g., in local storage)
                localStorage.setItem('token', jwtToken);

                window.location.href = "/Index";
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    $('#show-error').html(`Field Email or Password does not correct!`);
                } else {
                    // Handle errors, if any
                    console.log('Error:', xhr);
                }
            }
        });
    });
});