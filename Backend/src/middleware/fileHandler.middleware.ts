import multer from 'multer'
import { Request } from 'express'

// Set up storage engine
const fileStorage = multer.diskStorage({
    destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) => {
        cb(null, './public/pdfs') // Set destination folder
    },
    filename: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) => {
        const name = file.originalname // Preserve the original file name
        cb(null, name) // Callback with filename
    }
})


const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true) // Accept file
    } else {
        console.log("Please upload Pdf")
        cb(null, false)
    }
}

// Configure multer with storage and fileFilter
export const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter, // Apply file type filter
})
