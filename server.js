const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

async function footballRequest(url) {
  const token = process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    throw new Error("Football API key is missing on Render.");
  }

  const response = await fetch(url, {
    headers: { "X-Auth-Token": token }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Football data request failed."
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

function sendError(res, error) {
  res.status(error.status || 502).json({
    error: error.message || "Could not reach football data."
  });
}

app.get("/api/competitions", async (req, res) => {
  try {
    const data = await footballRequest(
      "https://api.football-data.org/v4/competitions"
    );
    res.json(data);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/teams", async (req, res) => {
  const competition = String(req.query.competition || "PL").toUpperCase();
  const allowed = ["PL", "PD", "BL1", "SA", "FL1", "DED", "PPL"];

  if (!allowed.includes(competition)) {
    return res.status(400).json({
      error: "Choose a supported competition code."
    });
  }

  try {
    const data = await footballRequest(
      "https://api.football-data.org/v4/competitions/" +
      encodeURIComponent(competition) + "/teams"
    );

    const name = String(req.query.name || "").trim().toLowerCase();
    const teams = (data.teams || []).filter(team =>
      !name ||
      (team.name || "").toLowerCase().includes(name) ||
      (team.shortName || "").toLowerCase().includes(name) ||
      (team.tla || "").toLowerCase().includes(name)
    );

    res.json({
      competition: data.competition?.name || competition,
      count: teams.length,
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        venue: team.venue,
        website: team.website,
        founded: team.founded
      }))
    });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/teams/:id", async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid team ID." });
  }

  try {
    const data = await footballRequest(
      "https://api.football-data.org/v4/teams/" +
      encodeURIComponent(req.params.id)
    );
    res.json(data);
  } catch (error) {
    sendError(res, error);
  }
});

app.listen(PORT, () => {
  console.log("VORTEX FC AI running on port " + PORT);
});
