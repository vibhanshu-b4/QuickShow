import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import movieRoutes from './routes/movieRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes, { stripeWebhook } from './routes/bookingRoutes.js';

const app = express();
const port = 3000;

await connectDB(); // Wait for DB before starting server

// Middleware
app.use(cors());
app.use(clerkMiddleware())

// Stripe webhook needs raw body — must be before express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// JSON parser for all other routes
app.use(express.json());

// API Routes
app.get('/', (req, res) => res.send('Server is Live!'));

app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

app.use("/api/inngest", serve({ client: inngest, functions }));



app.listen(port, () => console.log(`Server Listening at http://localhost:${port}`));
