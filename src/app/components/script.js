// Array to store student IDs
let studentIDs = [];

// Function to save ID and generate initial QR code
function saveAndGenerateQRCode() {
    // Get the student ID from the input field
    const studentId = document.getElementById("studentId").value.trim();
    
    // Check if the input is empty or ID already exists
    if (!studentId) {
        alert("Please enter a Student ID.");
        return;
    }
    if (studentIDs.includes(studentId)) {
        alert("Student ID already exists.");
        return;
    }

    // Add the ID to the array if it doesn't already exist
    studentIDs.push(studentId);

    // Clear the input field
    document.getElementById("studentId").value = "";

    // Display all QR codes including the new one
    displayQRCodes();
    
    // Set an interval to update the QR code for this student every 2 minutes
    setInterval(() => updateQRCode(studentId), 120000); // 120000 ms = 2 minutes
}

// Function to display all QR codes
function displayQRCodes() {
    // Clear the container first to avoid duplicates
    const qrContainer = document.getElementById("allQRCodes");
    qrContainer.innerHTML = "";

    // Loop through each ID in the array and generate a QR code
    studentIDs.forEach((id) => {
        // Create a div for each student's QR code
        const qrDiv = document.createElement("div");
        qrDiv.className = "qr-item";
        qrDiv.id = `qr_${id}`; // Unique ID for each QR code div

        // Label with the student ID
        const label = document.createElement("p");
        label.textContent = `Student ID: ${id}`;

        // Generate and display the initial QR code
        updateQRCode(id, qrDiv);

        // Add the label to the div and append it to the main container
        qrDiv.appendChild(label);
        qrContainer.appendChild(qrDiv);
    });
}

// Function to generate and update QR code for a specific student ID
function updateQRCode(studentId, qrDiv = null) {
    // Get the current timestamp to make the QR code unique
    const timestamp = Date.now();

    // Define the QR data with the student ID and timestamp
    const qrData = `student_id=${studentId}&timestamp=${timestamp}`;

    // If no div is passed, select the student's existing div by its ID
    if (!qrDiv) {
        qrDiv = document.getElementById(`qr_${studentId}`);
        // Clear any existing QR code image
        qrDiv.querySelectorAll("img").forEach((img) => img.remove());
    }

    // Generate the new QR code with the updated data
    QRCode.toDataURL(qrData, function (error, url) {
        if (error) {
            console.error("Error generating QR Code:", error);
            return;
        }

        // Create an image element for the QR code
        const qrImage = document.createElement("img");
        qrImage.src = url;
        qrImage.alt = `QR Code for Student ID ${studentId}`;

        // Add the QR code image to the div
        qrDiv.insertBefore(qrImage, qrDiv.firstChild);
    });

    console.log(`QR Code updated for Student ID ${studentId} at ${new Date(timestamp).toLocaleTimeString()}`);
}