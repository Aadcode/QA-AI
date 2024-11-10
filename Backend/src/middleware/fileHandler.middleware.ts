import multer from 'multer';

import path from 'path';

import { Request, Response } from 'express';

// Multer setup
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, "./public/files"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const upload = multer({ storage: fileStorage, fileFilter });