const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const app = express();
app.use(cors());

// Connect to MongoDB
const MONGO = "mongodb://localhost:27017/formSubmission";
mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const formSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  contact: String,
  gender: String,
  subjects: mongoose.Schema.Types.Mixed,
  resume: mongoose.Schema.Types.Mixed,
  url: String,
  select: String,
  about: String,
  createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model("forms", formSchema);

app.post("/api/forms", upload.single("resume"), async (req, res) => {
  try {
    const body = req.body || {};
    const subjects = body.subjects ? JSON.parse(body.subjects) : {};
    const resume = req.file
      ? {
          path: req.file.path,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }
      : null;

    const doc = new Form({
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      email: body.email || "",
      contact: body.contact || "",
      gender: body.gender || "",
      subjects,
      resume,
      url: body.url || "",
      select: body.select || "",
      about: body.about || "",
    });

    await doc.save();
    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/forms", async (req, res) => {
  try {
    const docs = await Form.find().sort({ createdAt: -1 }).limit(100);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
