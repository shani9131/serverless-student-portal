/* TOAST */
function showToast(message, type="success"){
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = "9999";
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button class="btn-close btn-close-white me-2 m-auto"></button>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* DUAL-ROLE LOGIN CONTROLLER */
const studentBtn = document.getElementById("studentBtn");
const staffBtn = document.getElementById("staffBtn");

// Attach click listeners to the two new buttons
if (studentBtn && staffBtn) {
    studentBtn.addEventListener("click", (e) => {
        e.preventDefault();
        processLogin("student");
    });

    staffBtn.addEventListener("click", (e) => {
        e.preventDefault();
        processLogin("admin"); // Assuming your faculty/staff are saved as 'admin' in DynamoDB
    });
}

// The Upgraded Gatekeeper Login Function
async function processLogin(expectedRole) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorDiv = document.getElementById("roleError");
    
    // Clear old errors before trying
    if (errorDiv) errorDiv.style.display = "none";

    if (!email || !password) {
        showToast("Please enter email and password", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password: password })
        });

        const data = await response.json();

        // Check if backend approved the credentials
        if (response.ok && (data.success || data.token)) {
            
            const actualRole = data.role || "admin";

            // 🔥 THE GATEKEEPER CHECK: Does their DB role match the button they clicked?
            if (actualRole !== expectedRole) {
                if (errorDiv) {
                    errorDiv.innerText = `Access Denied: You are not authorized for the ${expectedRole.toUpperCase()} portal.`;
                    errorDiv.style.display = "block";
                }
                return; // Stop the login process instantly!
            }

            // If it matches, securely save the session data
            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("username", email);
            sessionStorage.setItem("role", actualRole); 
            sessionStorage.setItem("authToken", data.token); 
            
            // Link student ID
            if (data.studentId) {
                sessionStorage.setItem("studentId", data.studentId);
            } else if (actualRole === "student") {
                sessionStorage.setItem("studentId", email.split("@")[0].toUpperCase());
            }

            showToast("Login Successful! Redirecting...", "success");

            // Route to the correct dashboard based on verified role
            setTimeout(() => {
                if (actualRole === "student") {
                    window.location.href = "student-dashboard.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }, 1000);

        } else {
            // Wrong password or email
            if (errorDiv) {
                errorDiv.innerText = data.error || data.message || "Invalid credentials provided.";
                errorDiv.style.display = "block";
            }
        }

    } catch (error) {
        console.error("Auth Error:", error);
        if (errorDiv) {
            errorDiv.innerText = "Server connection error. Please try again later.";
            errorDiv.style.display = "block";
        }
    }
}

/* LOGOUT */
function logout(){
    sessionStorage.clear();
    window.location.href = "login.html";
}