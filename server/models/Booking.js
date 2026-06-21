import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true, index: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    amount: { type: Number, required: true },
    bookedSeats: [{ type: String, required: true }],
    isPaid: { type: Boolean, default: false },
    stripeSessionId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
