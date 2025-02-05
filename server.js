const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');


const credentials = JSON.parse(fs.readFileSync('google-credentials.json'));


const app = express();
const PORT = 5000;


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|doc|docx|txt/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            return cb(new Error('Only .pdf, .doc, .docx, and .txt files are allowed!'));
        }
    }
});


const SHEET_ID = "YOUR_GOOGLE_SHEET_ID";

async function addToGoogleSheet(formData, fileName) {
    try {
        const doc = new GoogleSpreadsheet(SHEET_ID);
        await doc.useServiceAccountAuth(credentials);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["FormResponses"];

       
        await sheet.addRow({
            Name: formData.name,
            Email: formData.email,
            Phone: formData.phone,
            Age: formData.age,
            Gender: formData.gender,
            Experience: formData.experience,
            Country: formData.country,
            Hobbies: formData.hobbies,
            Message: formData.message,
            File: fileName || "No file uploaded"
        });

        console.log("Data saved to Google Sheets");
    } catch (error) {
        console.error("Error saving data to Google Sheets:", error);
    }
}

// Handle form submission
app.post('/submit', upload.single('file-upload'), async (req, res) => {
    const formData = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'File upload is required.' });
    }

    await addToGoogleSheet(formData, file.filename);

    res.json({
        message: 'Form submitted successfully!',
        data: formData,
        file: file.filename
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
