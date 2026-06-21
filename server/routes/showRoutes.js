import express from "express";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { getMovieDetails } from "../utils/tmdb.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } }).sort({
      showDateTime: 1,
    });
    res.json({ success: true, shows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { movieId, showPrice, dateTimeSelection } = req.body;

    if (!movieId || !showPrice || !dateTimeSelection) {
      return res.status(400).json({ success: false, message: "movieId, showPrice, and dateTimeSelection are required" });
    }

    const movie = await getMovieDetails(movieId);
    const showsToCreate = [];

    Object.entries(dateTimeSelection).forEach(([date, times]) => {
      times.forEach((time) => {
        showsToCreate.push({
          movieId: String(movieId),
          movie,
          showDateTime: new Date(`${date}T${time}`),
          showPrice: Number(showPrice),
          occupiedSeats: {},
        });
      });
    });

    const shows = await Show.insertMany(showsToCreate);
    res.status(201).json({ success: true, shows });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get("/:showId/seats", async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    res.json({ success: true, occupiedSeats: Object.fromEntries(show.occupiedSeats || []) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/dashboard", async (req, res) => {
  try {
    const [activeShows, bookings, totalUsers] = await Promise.all([
      Show.find({ showDateTime: { $gte: new Date() } }).sort({ showDateTime: 1 }),
      Booking.find({ isPaid: true }),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      dashboardData: {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((total, booking) => total + booking.amount, 0),
        activeShows,
        totalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
