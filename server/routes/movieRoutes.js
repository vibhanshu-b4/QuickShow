import express from "express";
import Show from "../models/Show.js";
import { getMovieDetails, getNowPlayingMovies } from "../utils/tmdb.js";

const router = express.Router();

const groupShowTimes = (shows) =>
  shows.reduce((acc, show) => {
    const date = show.showDateTime.toISOString().split("T")[0];
    acc[date] ||= [];
    acc[date].push({
      time: show.showDateTime.toISOString(),
      showId: show._id,
    });
    return acc;
  }, {});

router.get("/now-playing", async (req, res) => {
  try {
    const movies = await getNowPlayingMovies();
    res.json({ success: true, movies });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await getMovieDetails(req.params.id);
    const shows = await Show.find({
      movieId: String(req.params.id),
      showDateTime: { $gte: new Date() },
    }).sort({ showDateTime: 1 });

    res.json({
      success: true,
      movie,
      dateTime: groupShowTimes(shows),
      shows,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

export default router;
