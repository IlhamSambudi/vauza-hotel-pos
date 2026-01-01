import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// import db from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/clients.js';
import hotelRoutes from './routes/hotels.js';
import reservationRoutes from './routes/reservations_SIMPLE.js';
import paymentRoutes from './routes/payments.js';
import testSheetsRoutes from './routes/testSheets.js';

const app = express();

app.use(cors()); // Allow all origins for development
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// db.query('SELECT 1', (err) => {
//     if (err) console.error('DB ERROR', err);
//     else console.log('MySQL connected');
// });

console.log("Google Sheets DB active");

app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/hotels', hotelRoutes);
app.use('/reservations', reservationRoutes);
app.use('/payments', paymentRoutes);
app.use('/sheet-test', testSheetsRoutes);

export default app;
