import multer from 'multer';
// Multer setup
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/files"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
export const upload = multer({ storage: fileStorage, fileFilter });
