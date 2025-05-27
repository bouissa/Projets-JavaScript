// --- Selectors ---
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const messageBox = document.getElementById('message');

// --- Event Listener for Login Form Submission ---
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Clear previous messages
    messageBox.textContent = "";
    messageBox.style.color = "red"; // Default color for errors

    // Load users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Find user by username
    const foundUser = users.find(user => user.username === username);

    if (!foundUser) {
        messageBox.textContent = "Identifiants incorrects.";
        return;
    }

    // Hash the entered password for comparison
    // WARNING: Hashing on client-side is not as secure as server-side hashing with salts.
    // This is done here to prevent storing/comparing plain/base64 passwords in localStorage,
    // adhering to the constraint of using localStorage for user data.
    let passwordMatch = false;
    try {
        // Assuming passwords in localStorage are also SHA-256 hashed now (will fix in signup.js)
        const enteredPasswordHash = await hashPassword(password);
        passwordMatch = foundUser.password === enteredPasswordHash; // Compare stored hash with entered hash
    } catch (error) {
        console.error("Erreur lors du hachage du mot de passe: ", error);
        messageBox.textContent = "Erreur lors de la vérification du mot de passe.";
        return;
    }

    if (!passwordMatch) {
        messageBox.textContent = "Identifiants incorrects.";
        return;
    }

    // Authentication successful - Store connected user (local session)
    // WARNING: Storing sensitive user data in localStorage is not recommended for real applications due to XSS risks.
    localStorage.setItem("sessionUser", JSON.stringify({
        username: foundUser.username,
        // Do NOT store password/hash in sessionUser in localStorage
        // Add other necessary user info here if needed (e.g., email, bio, avatar path)
    }));

    messageBox.style.color = "green";
    messageBox.textContent = "Connexion réussie !";

    // Redirect to dashboard after a short delay
    setTimeout(() => {
        window.location.href = "../client/page/dashboard.html";
    }, 1000); // Reduced delay for better UX
});

// --- Helper Function for Password Hashing (SHA-256) ---
// This function is asynchronous and should be awaited.
async function hashPassword(password) {
    const encoder = new TextEncoder(); // Used to encode string to bytes
    const data = encoder.encode(password);
    // Use SubtleCrypto for hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Hash the password
    // Convert buffer to byte array
    const byteArray = Array.from(new Uint8Array(hashBuffer));
    // Convert byte array to hex string (common representation for hashes)
    const hexHash = byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

/*
Improvements/Notes:
- Switched from btoa (Base64) to Web Crypto API (SHA-256) for password hashing before comparison.
  This is a significant security improvement, preventing direct password exposure in localStorage.
  Requires modifying signup.js to store hashed passwords.
- Added comments to explain the logic, localStorage usage, and security considerations.
- Reduced the redirect delay slightly for a snappier user experience.
- Added a try...catch block around password hashing for robustness.
- Modified sessionUser storage to exclude password hash.
*/
  