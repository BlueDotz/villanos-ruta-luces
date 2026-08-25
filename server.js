const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// JSONBin.io: almacenamiento externo gratuito que SÍ sobrevive a que Render
// duerma o se reinicie. Si no hay credenciales configuradas, se usa un
// archivo local como respaldo (útil solo para pruebas en tu ordenador).
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const USE_JSONBIN = Boolean(JSONBIN_BIN_ID && JSONBIN_API_KEY);
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Payload grande permitido porque las fotos van en base64
app.use(express.json({ limit: "8mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------------
// Almacenamiento
// ---------------------------------------------------------------------------

function emptyState() {
  return { votes: {}, images: {}, proposals: [] };
}

function normalize(parsed) {
  return {
    votes: parsed?.votes || {},
    images: parsed?.images || {},
    proposals: parsed?.proposals || [],
  };
}

async function readData() {
  if (USE_JSONBIN) {
    try {
      const res = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { "X-Master-Key": JSONBIN_API_KEY },
      });
      if (!res.ok) throw new Error(`JSONBin GET ${res.status}`);
      const json = await res.json();
      return normalize(json.record);
    } catch (e) {
      console.error("Error leyendo de JSONBin:", e);
      return emptyState();
    }
  }
  // Modo local (sin persistencia real, solo para desarrollo)
  if (!fs.existsSync(DATA_FILE)) return emptyState();
  try {
    return normalize(JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")));
  } catch (e) {
    console.error("Error leyendo data.json:", e);
    return emptyState();
  }
}

async function writeData(data) {
  if (USE_JSONBIN) {
    const res = await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`JSONBin PUT ${res.status}`);
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

app.get("/api/state", async (req, res) => {
  res.json(await readData());
});

app.post("/api/votes", async (req, res) => {
  const { person, first, second, third } = req.body || {};
  if (!person || !first || !second || !third) {
    return res.status(400).json({ error: "Faltan campos" });
  }
  if (new Set([first, second, third]).size < 3) {
    return res.status(400).json({ error: "Las tres opciones deben ser distintas" });
  }
  try {
    const data = await readData();
    data.votes[person] = { first, second, third, updatedAt: new Date().toISOString() };
    await writeData(data);
    res.json({ ok: true, vote: data.votes[person] });
  } catch (e) {
    console.error("Error guardando voto:", e);
    res.status(500).json({ error: "No se ha podido guardar. Inténtalo de nuevo." });
  }
});

app.post("/api/images", async (req, res) => {
  const { villainId, dataUrl } = req.body || {};
  if (!villainId) return res.status(400).json({ error: "Falta villainId" });
  try {
    const data = await readData();
    if (!dataUrl) {
      delete data.images[villainId];
    } else {
      data.images[villainId] = dataUrl;
    }
    await writeData(data);
    res.json({ ok: true });
  } catch (e) {
    console.error("Error guardando imagen:", e);
    res.status(500).json({ error: "No se ha podido guardar la imagen." });
  }
});

app.post("/api/proposals", async (req, res) => {
  const { by, name, note } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Falta el nombre del villano" });
  }
  try {
    const data = await readData();
    const proposal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      by: by || "Anónimo",
      name: name.trim(),
      note: (note || "").trim(),
      createdAt: new Date().toISOString(),
    };
    data.proposals.unshift(proposal);
    await writeData(data);
    res.json({ ok: true, proposal });
  } catch (e) {
    console.error("Error guardando propuesta:", e);
    res.status(500).json({ error: "No se ha podido enviar la propuesta." });
  }
});

app.delete("/api/proposals/:id", async (req, res) => {
  try {
    const data = await readData();
    data.proposals = data.proposals.filter((p) => p.id !== req.params.id);
    await writeData(data);
    res.json({ ok: true });
  } catch (e) {
    console.error("Error eliminando propuesta:", e);
    res.status(500).json({ error: "No se ha podido eliminar." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(USE_JSONBIN ? "Almacenamiento: JSONBin (persistente)" : "Almacenamiento: archivo local (solo pruebas)");
});
