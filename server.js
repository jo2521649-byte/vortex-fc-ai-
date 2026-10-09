const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Show the website from index.html
app.use(express.static(__dirname));

app.get("/api/competitions", async (req, res) => {
  const token = process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    return res.status(500).json({
      error: "Football API key is missing on the server."
    });
  }

  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions",
      {
        headers: {
          "X-Auth-Token": token
        }
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(502).json({
      error: "Could not connect to football-data.org."
    });
  }
});

app.listen(PORT, () => {
  console.log("VORTEX FC AI is running on port " + PORT);
});
