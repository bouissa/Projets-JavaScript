// --- Selectors ---
const profileForm = document.getElementById('profile-form');
const usernameInput = document.getElementById('profile-username');
const emailInput = document.getElementById('profile-email');
const passwordInput = document.getElementById('profile-password');
const bioInput = document.getElementById('profile-bio');
const avatarInput = document.getElementById('profile-photo');
const profileAvatarImg = document.getElementById('profile-avatar');
const profileError = document.getElementById('profile-error');
const profileSuccess = document.getElementById('profile-success');

const soldeTotalSpan = document.getElementById('solde-total');
const soldeChartCanvas = document.getElementById('soldeChart'); // Assuming the canvas has this ID

const passwordForm = document.getElementById('password-form'); // Assuming there's a separate password form
const oldPasswordInput = document.getElementById('old-password'); // Assuming this input exists
const newPasswordInput = document.getElementById('new-password'); // Assuming this input exists
const passwordMessage = document.getElementById('password-message'); // Assuming this element exists

// --- Data Functions ---
function getTransactions() {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getSessionUser() {
    return JSON.parse(localStorage.getItem("sessionUser"));
}

function setSessionUser(user) {
    localStorage.setItem("sessionUser", JSON.stringify(user));
}

// --- Helper Function for Password Hashing (SHA-256) ---
// Re-defining here as it's a pure front-end project without shared modules.
// In a larger project, this would be in a shared utility file.
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const byteArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

// --- Profile Loading and Display ---
async function loadProfile() {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
        // Redirect to login if no session user
        alert("Veuillez vous connecter pour voir votre profil.");
        window.location.href = "../public/login.html";
        return;
    }

    const users = getUsers();
    // Find the full user data from the users array based on session user identifier (assuming email is unique)
    // Using ID would be more robust if available from sessionUser
    const currentUser = users.find(user => user.email === sessionUser.email); // Using email as identifier

    if (!currentUser) {
         // User not found in the main users list, something is wrong.
        alert("Profil introuvable. Veuillez vous reconnecter.");
        localStorage.removeItem("sessionUser");
        window.location.href = "../public/login.html";
        return;
    }

    // Pre-fill form fields
    usernameInput.value = currentUser.username || '';
    emailInput.value = currentUser.email || '';
    bioInput.value = currentUser.bio || '';
    // Display avatar, use default if none is set
    profileAvatarImg.src = currentUser.avatar || '../assets/profil.png'; // Assuming default profile icon

    // Display total balance
    soldeTotalSpan.textContent = getSoldeTotal() + " €";

    // Render chart (if canvas exists)
    if (soldeChartCanvas) {
         renderSoldeChart(getTransactions()); // Pass transactions to chart function
    }
}

// Helper to calculate total balance across all transactions
function getSoldeTotal() {
  const transactions = getTransactions();
  let total = 0;
  transactions.forEach(t => {
    if (t.categorie === 'revenu') {
      total += t.montant;
    } else {
      total -= t.montant;
    }
  });
  return total.toFixed(2);
}

// --- Profile Form Submission (Update Profile Info & Avatar) ---
if (profileForm) { // Check if the profile form exists on the page
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const sessionUser = getSessionUser();
        if (!sessionUser) return; // Should not happen if loadProfile redirected

        let users = getUsers();
        const userIndex = users.findIndex(user => user.email === sessionUser.email); // Find user by email

        if (userIndex === -1) {
            profileError.textContent = "Erreur : Utilisateur non trouvé.";
            return;
        }

        const currentUser = users[userIndex];

        // --- Collect Updated Data ---
        const updatedUsername = usernameInput.value.trim();
        const updatedEmail = emailInput.value.trim();
        const updatedBio = bioInput.value.trim();
        const newPassword = passwordInput.value;
        const avatarFile = avatarInput.files[0];

        // Basic validation
        if (!updatedUsername || !updatedEmail) {
             profileError.textContent = "Le nom d'utilisateur et l'email sont requis.";
             return;
        }

        // Email uniqueness check (if email is changed)
        if (updatedEmail !== currentUser.email) {
            const emailExists = users.some((user, index) => user.email === updatedEmail && index !== userIndex);
            if (emailExists) {
                profileError.textContent = "Cet email est déjà utilisé par un autre compte.";
                return;
            }
             // Basic email format validation for new email
            if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(updatedEmail)) {
                profileError.textContent = "Veuillez entrer un email valide.";
                return;
            }
        }

        // --- Update User Object ---
        currentUser.username = updatedUsername;
        currentUser.email = updatedEmail;
        currentUser.bio = updatedBio;

        // --- Handle Password Change (Optional) ---
        if (newPassword) {
            if (newPassword.length < 6) {
                 profileError.textContent = "Le nouveau mot de passe doit contenir au moins 6 caractères.";
                 return;
            }
            try {
                 currentUser.password = await hashPassword(newPassword); // Hash and store new password
            } catch (error) {
                 console.error("Erreur lors du hachage du nouveau mot de passe: ", error);
                 profileError.textContent = "Erreur lors de la mise à jour du mot de passe.";
                 return;
            }
        }

        // --- Handle Avatar Upload (Optional) ---
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentUser.avatar = e.target.result; // Store image as Data URL (Base64)
                 // Save users array with updated user and avatar
                users[userIndex] = currentUser;
                saveUsers(users);
                 // Update session user (important if email or avatar changed)
                setSessionUser({ username: currentUser.username, email: currentUser.email /*, other needed info*/ });
                 // Update displayed avatar
                profileAvatarImg.src = currentUser.avatar;

                profileSuccess.textContent = 'Profil mis à jour (incluant avatar) !';
                profileError.textContent = '';
                passwordInput.value = ''; // Clear password field
            };
             reader.onerror = function() {
                 profileError.textContent = "Erreur lors de la lecture du fichier avatar.";
                 profileSuccess.textContent = '';
            };
            reader.readAsDataURL(avatarFile); // Read the file as a data URL
        } else {
             // No new avatar file, just save other profile updates
            users[userIndex] = currentUser;
            saveUsers(users);
             // Update session user (important if email or username changed)
            setSessionUser({ username: currentUser.username, email: currentUser.email /*, other needed info*/ });

            profileSuccess.textContent = 'Profil mis à jour !';
            profileError.textContent = '';
            passwordInput.value = ''; // Clear password field
        }

        // Note: If avatar upload happens, the save/update happens in reader.onload.
        // If no avatar upload, it happens in the else block.
        // This needs to be careful about async flow if both could happen.
        // A simpler approach might be to update user data first, then handle avatar separately.
        // Let's refine this logic slightly.

        if (!avatarFile) {
             // Save users array with updated user
            users[userIndex] = currentUser;
            saveUsers(users);

             // Update session user (important if email or username changed)
            setSessionUser({ username: currentUser.username, email: currentUser.email /*, other needed info*/ });

            profileSuccess.textContent = 'Profil mis à jour !';
            profileError.textContent = '';
            passwordInput.value = ''; // Clear password field
        }

        // If avatarFile exists, the saving and success message is handled inside reader.onload.
        // If no avatarFile, it's handled here.
        // This means success/error messages might appear at different times.
        // A more robust solution would manage state or chain promises.
    });
}

// --- Password Change Form Submission (Separate Form - Assumed Structure) ---
// If password change is in a separate form, this listener would be used.
// Based on profile.html analysis, password change is part of the main profile form.
// The logic above in profileForm submit listener handles password change.

if (passwordForm) {
     passwordForm.addEventListener("submit", async function (e) {
         e.preventDefault();

         const sessionUser = getSessionUser();
         if (!sessionUser) return;

         let users = getUsers();
         const userIndex = users.findIndex(user => user.email === sessionUser.email); // Find user by email
         if (userIndex === -1) {
             passwordMessage.textContent = "Erreur : Utilisateur non trouvé.";
             passwordMessage.style.color = "red";
             return;
         }
         const currentUser = users[userIndex];

         const oldPass = oldPasswordInput.value;
         const newPass = newPasswordInput.value;

         if (!oldPass || !newPass) {
              passwordMessage.textContent = "Veuillez remplir tous les champs.";
              passwordMessage.style.color = "red";
             return;
         }

         // Verify old password using SHA-256 hash
         let oldPasswordMatch = false;
         try {
             const oldPasswordHash = await hashPassword(oldPass);
             oldPasswordMatch = currentUser.password === oldPasswordHash; // Compare stored hash with entered hash
         } catch (error) {
             console.error("Erreur lors du hachage de l\'ancien mot de passe: ", error);
             passwordMessage.textContent = "Erreur lors de la vérification de l\'ancien mot de passe.";
             passwordMessage.style.color = "red";
             return;
         }

         if (!oldPasswordMatch) {
             passwordMessage.textContent = "Ancien mot de passe incorrect.";
             passwordMessage.style.color = "red";
             return;
         }

         if (newPass.length < 6) {
             passwordMessage.textContent = "Le nouveau mot de passe doit contenir au moins 6 caractères.";
             passwordMessage.style.color = "red";
             return;
         }

         // Hash and store the new password
         try {
             currentUser.password = await hashPassword(newPass);
             users[userIndex] = currentUser;
             saveUsers(users);

             passwordMessage.textContent = "Mot de passe mis à jour avec succès.";
             passwordMessage.style.color = "green";
             this.reset(); // Reset the password form
         } catch (error) {
             console.error("Erreur lors du hachage du nouveau mot de passe: ", error);
             passwordMessage.textContent = "Erreur lors de la mise à jour du mot de passe.";
             passwordMessage.style.color = "red";
         }
     });
}


// --- Delete Account Function ---
// This function needs to be triggered by a button click event listener somewhere.
// Assuming a button with ID 'delete-account-btn' exists on the profile page.
const deleteAccountBtn = document.getElementById('delete-account-btn'); // Assuming this button exists
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
        const sessionUser = getSessionUser();
        if (!sessionUser) return;

        if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            let users = getUsers();
            // Filter out the current user based on email
            users = users.filter(u => u.email !== sessionUser.email);
            saveUsers(users);

            // Clear session and transactions related to this user (requires tracking transactions by user ID, which is not currently implemented)
            // For this simple version, we'll just clear the session.
            localStorage.removeItem("sessionUser");
            // Note: Transactions created by this user will remain in localStorage unless filtered/managed per user.

            alert("Votre compte a été supprimé.");
            window.location.href = "../public/login.html";
        }
    });
}

// --- Chart Rendering (Monthly Balance) ---
// Renamed function to clarify its purpose and added parameter for transactions
function renderSoldeChart(transactions) {
  if (!soldeChartCanvas) return; // Ensure canvas exists

  // Calculate monthly balance
  const soldeParMois = new Array(12).fill(0);
  transactions.forEach(t => {
    const date = new Date(t.date);
    const mois = date.getMonth(); // 0 for Jan, 11 for Dec
    // Ensure montant is treated as number
    const montant = parseFloat(t.montant);
    if (!isNaN(montant)) {
        soldeParMois[mois] += (t.categorie === 'revenu' ? montant : -montant);
    }
  });

  // Destroy previous chart instance if it exists
  const existingChart = Chart.getChart(soldeChartCanvas);
  if (existingChart) {
      existingChart.destroy();
  }

  // Render new chart
  new Chart(soldeChartCanvas, {
    type: "bar", // Changed to bar for clearer monthly evolution
    data: {
      labels: [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ],
      datasets: [{
        label: "Solde (€)",
        data: soldeParMois.map(m => m.toFixed(2)), // Keep two decimal places for display
        backgroundColor: soldeParMois.map(solde => solde >= 0 ? '#4e73df' : '#e74c3c'), // Color bars based on positive/negative solde
        borderColor: soldeParMois.map(solde => solde >= 0 ? '#4e73df' : '#c0392b'),
        borderWidth: 1
      }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Allow canvas to resize with container
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
            legend: { display: false }, // Hide legend for single dataset
            title: { display: true, text: 'Évolution Mensuelle du Solde' }
        }
    }
  });
}

// --- Initialisation ---
loadProfile(); // Load profile data when the page loads

/*
Improvements/Notes:
- Implemented SHA-256 password hashing for password comparison and storage, consistent with login/signup.
- Added logic to load and display username, email, bio from localStorage.
- Added logic to handle avatar file input: read file as Data URL (Base64) and store in user object.
  WARNING: Storing large images in localStorage is not recommended due to space limitations.
- Updated user object in the main 'users' array and 'sessionUser' after profile modifications.
- Added basic validation for required fields (username, email).
- Improved email format validation using a regex.
- Refined error and success message display.
- Updated chart rendering: passed transactions data, ensured canvas existence, used Chart.getChart to destroy previous instance, changed to bar chart for clearer monthly view, colored bars based on value.
- Added comments and structured the code into logical sections.
- Made Delete Account function triggered by a button click listener (assuming button ID 'delete-account-btn').
- Noted the limitation that transactions are not filtered/deleted per user in the current setup.
*/
