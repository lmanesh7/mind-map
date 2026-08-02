const form = document.querySelector('form');

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	// Send login credentials to server for authentication
	const response = await fetch('/api/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	});

	// Handle the server response
	if (response.ok) {
		// User is authenticated, redirect to index page
		window.location.href = '/index.html';
	} else {
		// Authentication failed, display error message
		const message = await response.text();
		alert(message);
	}
});
