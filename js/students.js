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

/* LOGIN PROTECTION */
if(sessionStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

/* LOGOUT */
function logout(){
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("authToken"); // Also clear the JWT!
    window.location.href = "login.html";
}

/* LOAD STUDENTS */
async function loadStudents(){
    try{
        // 🔒 UPDATED: Using fetchSecure
        const response = await fetchSecure("/students");
        const students = await response.json();

        const table = document.getElementById("studentsTable");
        table.innerHTML = "";

        if(students.length === 0){
            table.innerHTML = `<tr><td colspan="6" class="text-center">No Students Found</td></tr>`;
            return;
        }

        students.forEach(student => {
            table.innerHTML += `
            <tr>
                <td class="font-monospace">${student.studentId}</td>
                <td class="fw-bold">${student.name}</td>
                <td><a href="mailto:${student.email}" class="text-decoration-none">${student.email}</a></td>
                <td><span class="badge bg-primary-subtle text-primary">${student.course}</span></td>
                <td>${student.semester}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white me-1 shadow-sm" title="Manage Student"
                    onclick="openManageModal('${student.studentId}', '${student.name}')">
                    <i class="bi bi-gear-fill"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-primary me-1 shadow-sm" title="Edit Student"
                    onclick="openEditModal('${student.studentId}', '${student.name}', '${student.email}', '${student.course}', '${student.semester}')">
                    <i class="bi bi-pencil"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-danger shadow-sm" title="Delete Student"
                    onclick="deleteStudent('${student.studentId}')">
                    <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        });

    }catch(error){
        console.error("Error loading students:", error);
        showToast("Error loading students", "danger");
    }
}

loadStudents();

/* ADD STUDENT */
async function addStudent(){
    const student = {
        studentId: document.getElementById("studentId").value,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        course: document.getElementById("course").value,
        semester: document.getElementById("semester").value
    };

    /* VALIDATION */
    if(!student.studentId || !student.name){
        showToast("Please fill all fields", "danger");
        return;
    }

    try{
        // 🔒 UPDATED: Using fetchSecure
        await fetchSecure("/addStudent",{
            method:"POST",
            body:JSON.stringify(student)
        });

        showToast("Student Added Successfully");

        /* CLOSE MODAL */
        bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();

        /* CLEAR FORM */
        document.getElementById("studentId").value = "";
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("course").value = "";
        document.getElementById("semester").value = "";

        loadStudents();

    }catch(error){
        console.error(error);
        showToast("Error adding student", "danger");
    }
}

/* DELETE STUDENT */
async function deleteStudent(id){
    if(!confirm("Are you sure you want to delete?")) return;

    try{
        // 🔒 UPDATED: Using fetchSecure
        await fetchSecure("/deleteStudent",{
            method:"DELETE",
            body:JSON.stringify({studentId:id})
        });

        showToast("Student Deleted", "danger");
        loadStudents();

    }catch(error){
        console.error(error);
        showToast("Error deleting student", "danger");
    }
}

/* OPEN EDIT MODAL */
function openEditModal(id, name, email, course, semester){
    document.getElementById("editStudentId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editEmail").value = email;
    document.getElementById("editCourse").value = course;
    document.getElementById("editSemester").value = semester;

    const modal = new bootstrap.Modal(document.getElementById("editStudentModal"));
    modal.show();
}

/* UPDATE STUDENT */
async function updateStudent(){
    const student = {
        studentId: document.getElementById("editStudentId").value,
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        course: document.getElementById("editCourse").value,
        semester: document.getElementById("editSemester").value
    };

    try{
        // 🔒 UPDATED: Using fetchSecure
        await fetchSecure("/updateStudent",{
            method:"PUT",
            body: JSON.stringify(student)
        });

        showToast("Student Updated Successfully");

        /* CLOSE MODAL */
        bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();

        loadStudents();

    }catch(error){
        console.error(error);
        showToast("Error updating student", "danger");
    }
}

/* =========================================
   INSTANT SEARCH ENGINE (FRONTEND FILTER)
   ========================================= */
function searchStudents() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const table = document.getElementById("studentsTable");
    const rows = table.getElementsByTagName("tr");

    let matchFound = false;

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].cells.length <= 1) continue;

        const idText = rows[i].cells[0].innerText.toLowerCase();
        const nameText = rows[i].cells[1].innerText.toLowerCase();
        const courseText = rows[i].cells[3].innerText.toLowerCase();

        if (idText.includes(input) || nameText.includes(input) || courseText.includes(input)) {
            rows[i].style.display = "";
            matchFound = true;
        } else {
            rows[i].style.display = "none";
        }
    }

    const existingNoResult = document.getElementById("noResultRow");
    if (!matchFound && input !== "") {
        if (!existingNoResult) {
            table.innerHTML += `<tr id="noResultRow"><td colspan="6" class="text-center text-danger py-4">No matching students found for "${input}"</td></tr>`;
        } else {
            existingNoResult.innerHTML = `<td colspan="6" class="text-center text-danger py-4">No matching students found for "${input}"</td>`;
            existingNoResult.style.display = "";
        }
    } else if (existingNoResult) {
        existingNoResult.style.display = "none";
    }
}

/* =========================================
   STUDENT MANAGEMENT CONTROLLERS 
   ========================================= */

/* OPEN MANAGE STUDENT MODAL */
function openManageModal(studentId, studentName) {
    document.getElementById('manageStudentId').value = studentId;
    document.getElementById('manageStudentName').innerText = studentName + " (" + studentId + ")";
    
    const manageModal = new bootstrap.Modal(document.getElementById('manageStudentModal'));
    manageModal.show();
}

async function sendManagementData(action, payload) {
    const studentId = document.getElementById('manageStudentId').value;
    const requestBody = { action: action, studentId: studentId, ...payload };

    try {
        // 🔒 Using your secure wrapper to talk to the new backend route!
        const response = await fetchSecure("/manage-student", {
            method: "POST",
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (response.ok) {
            showToast(data.message || "Data successfully assigned to student.", "success");
            
            // Clear inputs after successful submission
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