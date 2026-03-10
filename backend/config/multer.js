import multer from "multer";

// ── Cloudinary Integration ──────────────────────────────────────────
// Files are held in memory (Buffer) and streamed directly to Cloudinary.
// Local disk save is intentionally disabled.
const storage = multer.memoryStorage();

// ── OLD: disk-based local storage (commented out) ───────────────────
// const storage = multer.diskStorage({
//   destination: "uploads",
//   filename: (req, file, cb) => {
//     return cb(null, `${Date.now()}${file.originalname}`);
//   },
// });

export const upload = multer({ storage });
