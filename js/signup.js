// --- Selectors ---
const form = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const messageBox = document.getElementById('message');

// --- Helper Function for Password Hashing (SHA-256) ---
// This function is asynchronous and should be awaited.
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const byteArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

// --- Event Listener for Registration Form Submission ---
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Clear previous messages
    messageBox.textContent = "";
    messageBox.style.color = "red"; // Default color for errors

    // --- Validation ---
    if (password !== confirmPassword) {
        messageBox.textContent = "Les mots de passe ne correspondent pas.";
        return;
    }

    if (password.length < 6) {
        messageBox.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
        return;
    }

    // Basic email format validation
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        messageBox.textContent = "Veuillez entrer un email valide.";
        return;
    }

    // Load users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already exists
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
        messageBox.textContent = "Cet email est déjà utilisé.";
        return;
    }

    // --- Hash Password and Create New User ---
    let hashedPassword;
    try {
        hashedPassword = await hashPassword(password);
    } catch (error) {
        console.error("Erreur lors du hachage du mot de passe: ", error);
        messageBox.textContent = "Une erreur est survenue lors de l'inscription.";
        return;
    }

    const newUser = {
        id: Date.now().toString(), // Simple unique ID
        email: email,
        username: username,
        password: hashedPassword, // Store hashed password
        bio: "", // Default empty bio
        avatar: "" // Default empty avatar path (will use default icon in profile)
    };

    // Add new user and save to localStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // --- Success and Redirection ---
    messageBox.style.color = "green";
    messageBox.textContent = "Inscription réussie ! Redirection...";

    setTimeout(() => {
        window.location.href = "../public/login.html"; // Redirect to login page
    }, 1000); // Reduced delay
});

/*
Improvements/Notes:
- Implemented SHA-256 password hashing using Web Crypto API before storing.
  Ensures consistency with login.js for secure comparison.
- Added basic email format validation.
- Included id, bio, and avatar fields in the user object for profile management.
- Added comments for clarity and future maintenance.
- Reduced the redirection delay.
*/
  