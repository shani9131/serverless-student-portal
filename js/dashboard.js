/* LOGIN PROTECTION */
if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

/* LOGOUT */
function logout() {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("authToken"); // 🔒 SECURITY: Destroy the JWT
    sessionStorage.removeItem("role");
    window.location.href = "login.html";
}

/* OPEN MANAGE STUDENT MODAL */
function openManageModal(studentId, studentName) {
    document.getElementById('manageStudentId').value = studentId;
    document.getElementById('manageStudentName').innerText = studentName + " (" + studentId + ")";
    
    const manageModal = new bootstrap.Modal(document.getElementById('manageStudentModal'));
    manageModal.show();
}

/* LOAD DASHBOARD */
async function loadDashboard() {
    try {
        // 🔒 SECURITY: Using our secure JWT engine
        const response = await fetchSecure("/students");

        if (!response.ok) {
            throw new Error("Failed to fetch students from API Gateway");
        }

        const students = await response.json();
        console.log("Fetched Students Array:", students);

        /* 1. UPDATE TOTAL STUDENTS METRIC */
        document.getElementById("totalStudents").innerText = students.length;

        /* 2. UPDATE UNIQUE COURSES COUNT */
        const courses = new Set(students.map(s => s.course).filter(Boolean));
        document.getElementById("totalCourses").innerText = courses.size;

        /* 3. UPDATE UNIQUE SEMESTERS COUNT */
        const semesters = new Set(students.map(s => s.semester).filter(Boolean));
        document.getElementById("totalDepartments").innerText = semesters.size;

        /* 4. UPDATE ACTIVE USERS METRIC (MATCHES TOTAL REGISTERED) */
        document.getElementById("activeUsers").innerText = students.length;

        /* 5. RENDER RECENT STUDENTS TABLE (MAX 5 ENTRIES) */
        const table = document.getElementById("recentStudents");
        table.innerHTML = "";

        if (students.length === 0) {
            // Updated colspan to 6 to account for the new Action column
            table.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No Registered Students Found</td></tr>`;
        } else {
            // Slice to get top 5 items from the list
            students.slice(0, 5).forEach(student => {
                table.innerHTML += `
                <tr>
                    <td class="font-monospace fw-medium text-secondary">${student.studentId || '--'}</td>
                    <td class="fw-bold text-dark">${student.name || '--'}</td>
                    <td><a href="mailto:${student.email}" class="text-decoration-none">${student.email || '--'}</a></td>
                    <td><span class="badge bg-primary-subtle text-primary">${student.course || '--'}</span></td>
                    <td><span class="badge bg-light text-dark border">${student.semester || '--'}</span></td>
                    <td>
                        <button onclick="openManageModal('${student.studentId}', '${student.name}')" class="btn btn-sm btn-info text-white fw-bold shadow-sm">
                            <i class="bi bi-gear-fill"></i> Manage
                        </button>
                    </td>
                </tr>
                `;
            });
        }

        /* 6. COMPUTE COURSE DISTRIBUTION & INITIALIZE CHART.JS */
        const courseCount = {};
        students.forEach(s => {
            if (s.course) {
                courseCount[s.course] = (courseCount[s.course] || 0) + 1;
            }
        });

        const labels = Object.keys(courseCount);
        const data = Object.values(courseCount);

        const canvas = document.getElementById("attendanceChart");

        if (canvas) {
            const ctx = canvas.getContext("2d");

            // Safeguard to clear previous chart instances if re-loading
            if (window.myDashboardChart) {
                window.myDashboardChart.destroy();
            }

            window.myDashboardChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Students Enrolled",
                        data: data,
                        backgroundColor: "rgba(13, 110, 253, 0.75)", // Bootstrap primary styling
                        borderColor: "rgb(13, 110, 253)",
                        borderWidth: 1.5,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false // Cleans up the visual display UI
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1, // Cleaner presentation metrics for student entries
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error("Dashboard Render Error:", error);

        document.getElementById("totalStudents").innerText = "Error";
        document.getElementById("totalCourses").innerText = "Error";
        document.getElementById("totalDepartments").innerText = "Error";
        document.getElementById("activeUsers").innerText = "Error";
        
        const table = document.getElementById("recentStudents");
        if (table) {
            table.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">Failed to load system data metrics from cloud.</td></tr>`;
        }
    }
}

/* INITIALIZE EXECUTION ON LOAD */
window.addEventListener("DOMContentLoaded", loadDashboard);

// CHANGE PASSWORD CONTROLLER
const changePasswordForm = document.getElementById('changePasswordForm');

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const alertBox = document.getElementById('passwordAlert');
        const username = sessionStorage.getItem('username'); // Get the logged-in admin's email

        alertBox.style.display = 'none';

        if (newPassword !== confirmPassword) {
            alertBox.innerText = "New passwords do not match!";
            alertBox.style.display = 'block';
            return;
        }

        const btn = document.getElementById('btnUpdatePwd');
        btn.innerText = "Updating...";
        btn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: username, 
                    oldPassword: oldPassword, 
                    newPassword: newPassword 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success! Close modal and show toast
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                modal.hide();
                changePasswordForm.reset();
                showToast("Password updated successfully!", "success");
            } else {
                alertBox.innerText = data.error || "Failed to update password.";
                alertBox.style.display = 'block';
            }
        } catch (error) {
            alertBox.innerText = "Server connection error.";
            alertBox.style.display = 'block';
        } finally {
            btn.innerText = "Update Password";
            btn.disabled = false;
        }
    });
}

// -------------------------------------------------------------
// STUDENT MANAGEMENT CONTROLLERS (SUBJECTS, ATTENDANCE, FEES)
// -------------------------------------------------------------

async function sendManagementData(action, payload) {
    const studentId = document.getElementById('manageStudentId').value;
    
    // Add the action and studentId to whatever specific data the form collected
    const requestBody = { action: action, studentId: studentId, ...payload };

    try {
        const response = await fetch(`${API_BASE}/manage-student`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (response.ok) {
            showToast(data.message || "Data successfully assigned to student.", "success");
            
            // Optionally clear inputs after successful submission
            if(action === 'add-subject') document.getElementById('addSubjectForm').reset();
            if(action === 'update-attendance') document.getElementById('updateAttendanceForm').reset();
            if(action === 'add-fee') document.getElementById('addFeeForm').reset();
            
        } else {
            showToast("Error: " + (data.error || "Failed to update record."), "danger");
        }
    } catch (err) {
        showToast("Server connection failed.", "danger");
    }
}

// 1. Listen for Add Subject
const addSubjectForm = document.getElementById('addSubjectForm');
if (addSubjectForm) {
    addSubjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendManagementData('add-subject', {
            subjectName: document.getElementById('subjectName').value,
            faculty: document.getElementById('facultyName').value
        });
    });
}

// 2. Listen for Update Attendance
const updateAttendanceForm = document.getElementById('updateAttendanceForm');
if (updateAttendanceForm) {
    updateAttendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendManagementData('update-attendance', {
            percentage: document.getElementById('attendancePercent').value
        });
    });
}

// 3. Listen for Add Fee
const addFeeForm = document.getElementById('addFeeForm');
if (addFeeForm) {
    addFeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendManagementData('add-fee', {
            description: document.getElementById('feeDesc').value,
            amount: document.getElementById('feeAmount').value,
            status: document.getElementById('feeStatus').value
        });
    });
}