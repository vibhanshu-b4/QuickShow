import express from "express";
import { getAuth, requireAuth } from "@clerk/express";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Helper: create booking + mark seats (idempotent via stripeSessionId unique index)
const fulfillBooking = async (session) => {
  const { userId, showId, seats, amount } = session.metadata;
  const selectedSeats = JSON.parse(seats);

  // Check if already fulfilled
  const existing = await Booking.findOne({ stripeSessionId: session.id });
  if (existing) return existing;

  const show = await Show.findById(showId);
  if (!show) throw new Error("Show not found");

  // Mark seats occupied
  const occupiedSeats = show.occupiedSeats || new Map();
  selectedSeats.forEach((seat) => occupiedSeats.set(seat, userId));
  show.occupiedSeats = occupiedSeats;
  await show.save();

  // Create booking
  return Booking.create({
    user: userId,
    show: show._id,
    amount: Number(amount),
    bookedSeats: selectedSeats,
    isPaid: true,
    stripeSessionId: session.id,
  });
};

// POST /api/bookings/checkout — Create Stripe Checkout Session
router.post("/checkout", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { showId, selectedSeats } = req.body;

    if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: "showId and selectedSeats are required" });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    // Check seat availability
    const occupiedSeats = show.occupiedSeats || new Map();
    const alreadyBooked = selectedSeats.filter((seat) => occupiedSeats.has(seat));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.join(", ")}`,
      });
    }

    const amount = selectedSeats.length * show.showPrice;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${show.movie.title} — Movie Tickets`,
              description: `Seats: ${selectedSeats.join(", ")}`,
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        userId,
        showId,
        seats: JSON.stringify(selectedSeats),
        amount: String(amount),
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/verify — Verify payment & fulfill booking (success page calls this)
router.get("/verify", async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "session_id is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const booking = await fulfillBooking(session);
      const populated = await Booking.findById(booking._id).populate("show");
      res.json({ success: true, booking: populated });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/my — User's bookings
router.get("/my", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const bookings = await Booking.find({ user: userId })
      .populate("show")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings — Admin: all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("show")
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stripe Webhook handler (exported separately — mounted in server.js with raw body)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    try {
      await fulfillBooking(event.data.object);
      console.log("Webhook: Booking fulfilled for session", event.data.object.id);
    } catch (error) {
      console.error("Webhook fulfillment error:", error.message);
    }
  }

  res.json({ received: true });
};

export default router;
