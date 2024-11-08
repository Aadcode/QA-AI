import express from 'express';
import uploadRoutes from './routes/upload.Routes.js';
const app = express();
// Middleware to parse JSON request bodies
app.use(express.json());
// Use the upload routes with a base route prefix
app.use('/app/v1', uploadRoutes);
app.listen(3000, () => {
    console.log('Listening at port 3000');
});
