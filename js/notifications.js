/* TOAST */
function showToast(message, type="success"){

    const toast = document.createElement("div");

    toast.className =
    `toast align-items-center text-white bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;

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

/* LOGIN CHECK */
if(sessionStorage.getItem("loggedIn") !== "true"){
    window.location.href = "login.html";
}

/* LOAD NOTIFICATIONS */
async function loadNotifications(){

    const container = document.getElementById("notificationsContainer");

    try{
        // 🔒 UPDATED: Using fetchSecure
        const response = await fetchSecure("/notifications");

        const data = await response.json();

        container.innerHTML = "";

        if(data.length === 0){

            container.innerHTML = `
            <div class="col-12">
                <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <i class="bi bi-bell fs-1 text-muted"></i>
                    <h5 class="mt-3">No Notifications Available</h5>
                </div>
            </div>
            `;

            return;
        }

        data.forEach(n => {

            container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card border-0 shadow-sm rounded-4 h-100 notification-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="fw-bold mb-2">
                                    <i class="bi bi-bell-fill text-warning me-2"></i>
                                    ${n.title}
                                </h5>
                            </div>
                            <button class="btn btn-sm btn-light rounded-circle"
                            onclick="deleteNotification('${n.notificationId}')">
                                <i class="bi bi-trash text-danger"></i>
                            </button>
                        </div>
                        <p class="text-muted mb-0">
                            ${n.message}
                        </p>
                    </div>
                </div>
            </div>
            `;
        });

    }catch(error){
        console.error(error);
        showToast("Error loading notifications", "danger");
    }
}

/* ADD NOTIFICATION */
async function addNotification(){

    const title = document.getElementById("notificationTitle").value;
    const message = document.getElementById("notificationMessage").value;

    if(!title || !message){
        showToast("Please fill all fields", "warning");
        return;
    }

    try{
        // 🔒 UPDATED: Using fetchSecure and removed manual headers
        const response = await fetchSecure("/addnotification", {
            method: "POST",
            body: JSON.stringify({
                title,
                message
            })
        });

        if(!response.ok){
            throw new Error();
        }

        showToast("Notification added successfully");

        document.getElementById("notificationTitle").value = "";
        document.getElementById("notificationMessage").value = "";

        bootstrap.Modal.getInstance(
            document.getElementById("addNotificationModal")
        ).hide();

        loadNotifications();

    }catch(error){
        console.error(error);
        showToast("Error adding notification", "danger");
    }
}

/* DELETE NOTIFICATION */
async function deleteNotification(notificationId){

    if(!confirm("Delete this notification?")){
        return;
    }

    try{
        // 🔒 UPDATED: Using fetchSecure and removed manual headers
        const response = await fetchSecure("/deleteNotification", {
            method: "DELETE",
            body: JSON.stringify({
                notificationId
            })
        });

        if(!response.ok){
            throw new Error();
        }

        showToast("Notification deleted");

        loadNotifications();

    }catch(error){
        console.error(error);
        showToast("Error deleting notification", "danger");
    }
}

/* INIT */
loadNotifications();