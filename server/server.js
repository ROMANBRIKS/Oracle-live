const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Oracle Live Backend Running 🚀");
});

// Dummy videos API (we’ll replace later)
app.get("/videos", (req, res) => {
  res.json([
    {
      id: 1,
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      user: "User1",
    },
    {
      id: 2,
      url: "https://www.w3schools.com/html/movie.mp4",
      user: "User2",
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
