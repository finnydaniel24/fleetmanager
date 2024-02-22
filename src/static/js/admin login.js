function validateForm(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Retrieve input values
    var username = document.getElementById('Username').value;
    var password = document.getElementById('password').value;

    // Sample credentials for validation
    var validUsername = 'admin';
    var validPassword = 'nbkr123';

    // Perform validation
    if (username === validUsername && password === validPassword) {
        // Show login success message
        alert('Login successful');

        // Redirect to another page upon successful login
        redirectToPage('Dashboard.html');
    } else {
        // Show an error message if credentials are incorrect
        alert('Invalid credentials. Please try again.');
    }
}

function redirectToPage(pageUrl) {
    // Use window.location.replace() to redirect to another page
    window.location.replace(pageUrl);
}
