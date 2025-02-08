const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

// ✅ Supabase Client Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Allow frontend running on localhost
const allowedOrigins = [
  "http://localhost:3000", // ✅ React frontend URL (adjust if needed)
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { userid, password } = req.body;
    if (!userid || !password) return res.status(400).json({ success: false, message: "Missing credentials" });

    console.log("🔵 Login attempt:", { userid });

    const { data, error } = await supabase
      .from("users")
      .select("password_hash, role")
      .eq("userid", userid)
      .single();

    if (error) {
      console.error("❌ Supabase error (Login):", error);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (!data || data.password_hash !== crypto.createHash("md5").update(password).digest("hex")) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, role: data.role });
  } catch (err) {
    console.error("🔥 Server error (Login):", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/getUserData", async (req, res) => {
  try {
    const { userid, role } = req.body;
    if (!userid || !role) return res.status(400).json({ success: false, message: "Missing parameters" });

    console.log(`🔵 Fetching data for UserID: ${userid}, Role: ${role}`);

    let query = supabase.from("users").select("*");

    if (role !== "admin") {
      query = query.eq("userid", userid); // ✅ Basic users see only their data
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error (Fetching Data):", error);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, table: data });
  } catch (err) {
    console.error("🔥 Server error (Fetching Data):", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// ✅ Health Check Endpoint
app.get("/", (req, res) => {
  res.send("Backend is running locally! 🚀");
});

// ✅ Start Server Locally
const PORT = 3001; // Local backend server port
app.listen(PORT, () => console.log(`✅ Local server running on http://localhost:${PORT}`));
