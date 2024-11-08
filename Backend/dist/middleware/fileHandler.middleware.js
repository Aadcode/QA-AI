import multer from 'multer';
// Set up storage engine
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/pdfs'); // Set destination folder
    },
    filename: (req, file, cb) => {
        const name = file.originalname; // Preserve the original file name
        cb(null, name); // Callback with filename
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept file
    }
    else {
        console.log("Please upload Pdf");
        cb(null, false);
    }
};
// Configure multer with storage and fileFilter
export const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter, // Apply file type filter
});
