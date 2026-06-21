import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true, index: true },
    movie: { type: mongoose.Schema.Types.Mixed, required: true },
    showDateTime: { type: Date, required: true, index: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);

export default Show;
