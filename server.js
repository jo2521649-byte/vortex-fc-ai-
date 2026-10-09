const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
res.json({
app: "VORTEX FC AI",
status: "Backend is running",
message: "Football Intelligence & AI Analysis"
});
});

app.get("/api/competitions", async (req, res) => {
const token = process.env.FOOTBALL_DATA_API_KEY;

if (!token) {
return res.status(500).json({
error: "API key is not configured on the server yet."
});
}

try {
const response = await fetch(
"https://api.football-data.org/v4/competitions",
{ headers: { "X-Auth-Token": token } }
);

const data = await response.json();
res.status(response.status).json(data);

} catch (error) {
res.status(502).json({ error: "Could not reach football-data.org." });
}
});

app.listen(PORT, () => {
console.log("VORTEX FC AI running on port ${PORT}");
});
