const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Payload grande permitido porque las fotos van en base64
app.use(express.json({ limit: "8mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------------
// Almacenamiento sencillo en un archivo JSON (suficiente para un grupo pequeño)
// ---------------------------------------------------------------------------

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { votes: {}, images: {}, proposals: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      votes: parsed.votes || {},
      images: parsed.images || {},
      proposals: parsed.proposals || [],
    };
  } catch (e) {
    console.error("Error leyendo data.json:", e);
    return { votes: {}, images: {}, proposals: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

app.get("/api/state", (req, res) => {
  res.json(readData());
});

app.post("/api/votes", (req, res) => {
  const { person, first, second, third } = req.body || {};
  if (!person || !first || !second || !third) {
    return res.status(400).json({ error: "Faltan campos" });
  }
  if (new Set([first, second, third]).size < 3) {
    return res.status(400).json({ error: "Las tres opciones deben ser distintas" });
  }
  const data = readData();
  data.votes[person] = { first, second, third, updatedAt: new Date().toISOString() };
  writeData(data);
  res.json({ ok: true, vote: data.votes[person] });
});

app.post("/api/images", (req, res) => {
  const { villainId, dataUrl } = req.body || {};
  if (!villainId) return res.status(400).json({ error: "Falta villainId" });
  const data = readData();
  if (!dataUrl) {
    delete data.images[villainId];
  } else {
    data.images[villainId] = dataUrl;
  }
  writeData(data);
  res.json({ ok: true });
});

app.post("/api/proposals", (req, res) => {
  const { by, name, note } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Falta el nombre del villano" });
  }
  const data = readData();
  const proposal = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    by: by || "Anónimo",
    name: name.trim(),
    note: (note || "").trim(),
    createdAt: new Date().toISOString(),
  };
  data.proposals.unshift(proposal);
  writeData(data);
  res.json({ ok: true, proposal });
});

app.delete("/api/proposals/:id", (req, res) => {
  const data = readData();
  data.proposals = data.proposals.filter((p) => p.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
