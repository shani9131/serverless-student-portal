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

/* LOAD CONTACTS */
async function loadContacts(){

    const container = document.getElementById("contactsContainer");

    try{
        // 🔒 UPDATED: Using fetchSecure for the GET request
        const response = await fetchSecure("/contacts");

        if(!response.ok){
            throw new Error("API Error");
        }

        const contacts = await response.json();

        container.innerHTML = "";

        /* EMPTY STATE */
        if(contacts.length === 0){

            container.innerHTML = `
            <div class="col-12">
                <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <i class="bi bi-person-lines-fill fs-1 text-muted"></i>
                    <h5 class="mt-3">No Contacts Available</h5>
                </div>
            </div>
            `;

            return;
        }

        contacts.forEach(c => {

            container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card contact-card shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="fw-bold mb-0">
                                <i class="bi bi-person-circle text-primary me-2"></i>
                                ${c.name}
                            </h5>
                            <button class="btn btn-sm btn-light rounded-circle"
                            onclick="deleteContact('${c.contactId}')">
                                <i class="bi bi-trash text-danger"></i>
                            </button>
                        </div>
                        <p class="mb-2">
                            <i class="bi bi-envelope-fill text-primary me-2"></i>
                            <a href="mailto:${c.email}" class="text-decoration-none">
                                ${c.email}
                            </a>
                        </p>
                        <p class="mb-0">
                            <i class="bi bi-telephone-fill text-success me-2"></i>
                            <a href="tel:${c.phone}" class="text-decoration-none">
                                ${c.phone}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            `;
        });

    }catch(error){
        console.error(error);
        showToast("Error loading contacts", "danger");
    }
}

/* ADD CONTACT */
async function addContact(){

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const phone = document.getElementById("contactPhone").value;

    if(!name || !email || !phone){
        showToast("Please fill all fields", "warning");
        return;
    }

    try{
        // 🔒 UPDATED: Using fetchSecure and removed manual headers
        const response = await fetchSecure("/addcontact", {
            method:"POST",
            body:JSON.stringify({
                name,
                email,
                phone
            })
        });

        if(!response.ok){
            throw new Error();
        }

        showToast("Contact added successfully");

        document.getElementById("contactName").value = "";
        document.getElementById("contactEmail").value = "";
        document.getElementById("contactPhone").value = "";

        bootstrap.Modal.getInstance(
            document.getElementById("addContactModal")
        ).hide();

        loadContacts();

    }catch(error){
        console.error(error);
        showToast("Error adding contact", "danger");
    }
}

/* DELETE CONTACT */
async function deleteContact(contactId){

    if(!confirm("Delete this contact?")){
        return;
    }

    try{
        // 🔒 UPDATED: Using fetchSecure and removed manual headers
        const response = await fetchSecure("/deleteContact", {
            method:"DELETE",
            body:JSON.stringify({
                contactId
            })
        });

        if(!response.ok){
            throw new Error();
        }

        showToast("Contact deleted successfully");

        loadContacts();

    }catch(error){
        console.error(error);
        showToast("Error deleting contact", "danger");
    }
}

/* INIT */
loadContacts();