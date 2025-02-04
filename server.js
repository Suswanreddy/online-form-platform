const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    },
});

const upload = multer({ storage: storage });

// Endpoint for handling form submission
app.post("/submit-form", upload.single("file-upload"), (req, res) => {
    const formData = req.body;
    const uploadedFile = req.file ? req.file.filename : null;

    console.log("Received Form Data:", formData);
    console.log("Uploaded File:", uploadedFile);

    res.json({ 
        message: "Form submitted successfully!", 
        data: formData, 
        file: uploadedFile 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
