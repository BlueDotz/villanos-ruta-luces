// ---------------------------------------------------------------------------
// DATOS
// ---------------------------------------------------------------------------

const CATEGORY_META = {
  comic: { label: "Cómic y superhéroes", color: "#5B2A86" },
  terror: { label: "Terror", color: "#B91C3C" },
  fantasia: { label: "Fantasía y magia", color: "#1F6B4C" },
  cine: { label: "Cine y clásicos", color: "#2E3A59" },
  comedia: { label: "Comedia", color: "#B8790F" },
};

const COMPLEXITY_META = {
  baja: { label: "Disfraz sencillo", color: "#1F6B4C" },
  media: { label: "Complejidad media", color: "#B8790F" },
  alta: { label: "Disfraz elaborado", color: "#B91C3C" },
};

const VILLAINS = [
  { id: "joker", name: "Joker", category: "comic", complexity: "media", note: "El villano más icónico del cómic: admite infinitas versiones de traje y maquillaje." },
  { id: "vader", name: "Darth Vader", category: "cine", complexity: "alta", note: "Capa negra, respiración pesada y el casco más reconocible de la ciencia ficción." },
  { id: "harley", name: "Harley Quinn", category: "comic", complexity: "media", note: "Un derroche de rojo y azul, muy divertido y fácil de identificar de lejos." },
  { id: "voldemort", name: "Lord Voldemort", category: "fantasia", complexity: "baja", note: "Con túnica oscura, maquillaje pálido y una varita, el disfraz está casi hecho." },
  { id: "malefica", name: "Maléfica", category: "fantasia", complexity: "alta", note: "Cuernos, capa negra y mucha actitud: uno de los disfraces femeninos más espectaculares." },
  { id: "freddy", name: "Freddy Krueger", category: "terror", complexity: "media", note: "Jersey a rayas rojo y verde, sombrero fedora y guante de cuchillas: reconocible al instante." },
  { id: "cruella", name: "Cruella de Vil", category: "cine", complexity: "media", note: "Abrigo de pieles a dos tonos y moño bicolor: puro glamour villano." },
  { id: "hannibal", name: "Hannibal Lecter", category: "terror", complexity: "baja", note: "La máscara metálica hace casi todo el trabajo; el resto es un mono sencillo." },
  { id: "pennywise", name: "Pennywise", category: "terror", complexity: "alta", note: "Maquillaje de payaso elaborado y globos rojos: muy potente si alguien se anima con el make-up." },
  { id: "ghostface", name: "Ghostface", category: "terror", complexity: "baja", note: "Túnica negra y máscara blanca: el disfraz de terror más rápido de montar." },
  { id: "alexdelarge", name: "Alex DeLarge", category: "cine", complexity: "media", note: "Bombín, pestaña postiza, bastón y un vaso de leche: un look muy teatral." },
  { id: "bellatrix", name: "Bellatrix Lestrange", category: "fantasia", complexity: "media", note: "Melena alborotada, ropa oscura y varita: un disfraz con mucho carácter." },
  { id: "catwoman", name: "Catwoman", category: "comic", complexity: "baja", note: "Traje de cuero negro ajustado: un clásico que siempre acierta." },
  { id: "garfio", name: "Capitán Garfio", category: "cine", complexity: "alta", note: "Levita roja, garfio dorado y sombrero de plumas: muy teatral y fácil de exagerar." },
  { id: "chucky", name: "Chucky", category: "terror", complexity: "baja", note: "Peto vaquero, camiseta a rayas y un cuchillo de juguete: terror ochentero muy reconocible." },
  { id: "drevil", name: "Dr. Evil", category: "comedia", complexity: "baja", note: "Calva, traje gris Nehru y el meñique en la boca: ideal para hacer el gamberro toda la noche." },
  { id: "farquaad", name: "Lord Farquaad", category: "comedia", complexity: "media", note: "Capa morada y una silueta diminuta muy exagerada: de los que más risas arrancan." },
  { id: "jigsaw", name: "Jigsaw / Billy the Puppet", category: "terror", complexity: "alta", note: "Traje negro, pajarita roja, cara blanca pintada y espirales rojas en las mejillas: una de las imágenes más inquietantes del terror." },
  { id: "poisonivy", name: "Poison Ivy", category: "comic", complexity: "alta", note: "Verde, hojas y enredaderas por todo el cuerpo: muy reconocible y de las opciones más espectaculares." },
  { id: "reinamalvada", name: "Reina Malvada", category: "fantasia", complexity: "media", note: "Capa oscura, corona y una manzana como complemento: un clásico Disney elegante donde los haya." },
];

const PEOPLE = ["Mariano", "Esther", "Santi", "Rafa", "Bea", "Laura", "Javi", "Álvaro", "Fer"];

const villainById = Object.fromEntries(VILLAINS.map((v) => [v.id, v]));

// ---------------------------------------------------------------------------
// ESTADO EN MEMORIA (se recarga desde el servidor)
// ---------------------------------------------------------------------------

let state = { votes: {}, images: {}, proposals: [] };

async function loadState() {
  const res = await fetch("/api/state");
  state = await res.json();
  renderGallery();
  renderProposals();
  renderResults();
}

// ---------------------------------------------------------------------------
// TABS
// ---------------------------------------------------------------------------

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------------------------------------------------------------------------
// GALERÍA
// ---------------------------------------------------------------------------

function renderGallery() {
  document.getElementById("galleryTitle").textContent = `Los ${VILLAINS.length} candidatos`;
  const grid = document.getElementById("villainGrid");
  grid.innerHTML = "";
  VILLAINS.forEach((v, i) => grid.appendChild(buildVillainCard(v, i)));
}

function buildVillainCard(v, index) {
  const meta = CATEGORY_META[v.category];
  const comp = COMPLEXITY_META[v.complexity];
  const card = document.createElement("div");
  card.className = "villain-card";

  const uploadedUrl = state.images[v.id];
  const staticCandidates = ["jpg", "jpeg", "png", "webp"].map((ext) => `images/${v.id}.${ext}`);
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent("disfraz " + v.name)}`;

  // Si hay foto subida desde la web, esa manda. Si no, probamos la carpeta images/.
  const initialSrc = uploadedUrl || staticCandidates[0];
  const fallbackQueue = uploadedUrl ? [] : staticCandidates.slice(1);

  card.innerHTML = `
    <div class="villain-photo" style="background: linear-gradient(135deg, ${meta.color}E6 0%, ${meta.color}99 100%);">
      <img src="${initialSrc}" alt="Foto de referencia de ${v.name}" data-fallback='${JSON.stringify(fallbackQueue)}' />
      <span class="letter" style="display:none;">${v.name.charAt(0)}</span>
      <span class="exp-tag">EXP. Nº ${String(index + 1).padStart(3, "0")}</span>
      <button class="photo-edit-btn" data-action="open-editor">${uploadedUrl ? "Cambiar" : "Añadir foto"}</button>
      <div class="photo-editor" style="display:none;">
        <label style="color:#fff; text-transform:none; font-weight:700; font-size:0.72rem;">📤 Sube una foto desde tu dispositivo</label>
        <label class="file-btn">
          <span class="file-btn-text">📤 Elegir archivo</span>
          <input type="file" accept="image/*" data-action="file-input" />
        </label>
        <p class="err" style="display:none;"></p>
        <div class="row">
          ${uploadedUrl ? `<button data-action="remove-photo">🗑️ Quitar foto</button>` : ""}
          <button data-action="close-editor">✕ Cerrar</button>
        </div>
      </div>
    </div>
    <div class="villain-body">
      <h3>${v.name}</h3>
      <div class="tag-row">
        <span class="cat-tag" style="background:${meta.color}18; color:${meta.color};">${meta.label}</span>
        <span class="complexity-tag" style="color:${comp.color};"><span class="dot" style="background:${comp.color};"></span>${comp.label}</span>
      </div>
      <p class="note">${v.note}</p>
      <a class="ref-link" href="${searchUrl}" target="_blank" rel="noopener noreferrer" style="color:${meta.color};">Ver referencia visual ↗</a>
    </div>
  `;

  const imgEl = card.querySelector("img");
  const letterEl = card.querySelector(".letter");
  imgEl.addEventListener("error", () => {
    const queue = JSON.parse(imgEl.dataset.fallback || "[]");
    if (queue.length) {
      const next = queue.shift();
      imgEl.dataset.fallback = JSON.stringify(queue);
      imgEl.src = next;
    } else {
      imgEl.style.display = "none";
      letterEl.style.display = "block";
    }
  });

  const editor = card.querySelector(".photo-editor");
  card.querySelector('[data-action="open-editor"]').addEventListener("click", () => {
    editor.style.display = "flex";
  });
  card.querySelector('[data-action="close-editor"]').addEventListener("click", () => {
    editor.style.display = "none";
  });
  const removeBtn = card.querySelector('[data-action="remove-photo"]');
  if (removeBtn) {
    removeBtn.addEventListener("click", async () => {
      await saveImage(v.id, "");
      await loadState();
    });
  }
  card.querySelector('[data-action="file-input"]').addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const errEl = card.querySelector(".err");
    errEl.style.display = "none";
    if (!file.type.startsWith("image/")) {
      errEl.textContent = "Elige un archivo de imagen (jpg, png...).";
      errEl.style.display = "block";
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await saveImage(v.id, dataUrl);
      await loadState();
    } catch (err) {
      errEl.textContent = "No se ha podido subir la imagen. Prueba con otra.";
      errEl.style.display = "block";
    }
  });

  return card;
}

function fileToCompressedDataUrl(file, maxDim = 640, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        } else {
          if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

async function saveImage(villainId, dataUrl) {
  await fetch("/api/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ villainId, dataUrl }),
  });
}

// ---------------------------------------------------------------------------
// PROPUESTAS
// ---------------------------------------------------------------------------

function fillSelect(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>` +
    options.map((o) => `<option value="${o.id}">${o.name}</option>`).join("");
}

fillSelect(document.getElementById("proposalBy"), PEOPLE.map((p) => ({ id: p, name: p })), "Selecciona tu nombre");

document.getElementById("proposalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const by = document.getElementById("proposalBy").value;
  const name = document.getElementById("proposalName").value.trim();
  const note = document.getElementById("proposalNote").value.trim();
  const msgEl = document.getElementById("proposalMsg");

  if (!name) {
    msgEl.textContent = "Escribe al menos el nombre del villano.";
    msgEl.className = "msg error";
    msgEl.style.display = "block";
    return;
  }

  const res = await fetch("/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ by, name, note }),
  });

  if (res.ok) {
    msgEl.textContent = "¡Propuesta enviada! Ya la ve todo el grupo.";
    msgEl.className = "msg ok";
    msgEl.style.display = "block";
    document.getElementById("proposalName").value = "";
    document.getElementById("proposalNote").value = "";
    await loadState();
  } else {
    msgEl.textContent = "No se ha podido enviar. Inténtalo de nuevo.";
    msgEl.className = "msg error";
    msgEl.style.display = "block";
  }
});

function renderProposals() {
  const list = document.getElementById("proposalsList");
  if (!state.proposals.length) { list.innerHTML = ""; return; }
  list.innerHTML = `<h3>💡 Propuestas del grupo (${state.proposals.length})</h3>` +
    state.proposals.map((p) => `
      <div class="proposal-item" data-id="${p.id}">
        <div class="top">
          <div>
            <div class="name">${p.name}</div>
            <div class="by">Propuesto por ${p.by}</div>
          </div>
          <button class="del" data-action="delete-proposal" data-id="${p.id}">🗑️</button>
        </div>
        ${p.note ? `<div class="note">${p.note}</div>` : ""}
      </div>
    `).join("");

  list.querySelectorAll('[data-action="delete-proposal"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      await fetch(`/api/proposals/${btn.dataset.id}`, { method: "DELETE" });
      await loadState();
    });
  });
}

// ---------------------------------------------------------------------------
// ENCUESTA
// ---------------------------------------------------------------------------

fillSelect(document.getElementById("votePerson"), PEOPLE.map((p) => ({ id: p, name: p })), "Selecciona tu nombre");
[document.getElementById("voteFirst"), document.getElementById("voteSecond"), document.getElementById("voteThird")].forEach((sel) => {
  fillSelect(sel, VILLAINS, "Selecciona un villano");
});

document.getElementById("votePerson").addEventListener("change", (e) => {
  const person = e.target.value;
  const wrap = document.getElementById("voteFormWrap");
  document.getElementById("voteMsg").style.display = "none";
  if (!person) { wrap.style.display = "none"; return; }
  wrap.style.display = "block";
  const existing = state.votes[person];
  document.getElementById("voteFirst").value = existing?.first || "";
  document.getElementById("voteSecond").value = existing?.second || "";
  document.getElementById("voteThird").value = existing?.third || "";
});

document.getElementById("voteSaveBtn").addEventListener("click", async () => {
  const person = document.getElementById("votePerson").value;
  const first = document.getElementById("voteFirst").value;
  const second = document.getElementById("voteSecond").value;
  const third = document.getElementById("voteThird").value;
  const msgEl = document.getElementById("voteMsg");

  if (!first || !second || !third) {
    msgEl.textContent = "Selecciona tus tres opciones antes de guardar.";
    msgEl.className = "msg error"; msgEl.style.display = "block";
    return;
  }
  if (new Set([first, second, third]).size < 3) {
    msgEl.textContent = "Las tres opciones deben ser distintas.";
    msgEl.className = "msg error"; msgEl.style.display = "block";
    return;
  }

  const btn = document.getElementById("voteSaveBtn");
  btn.disabled = true; btn.textContent = "Guardando...";

  const res = await fetch("/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person, first, second, third }),
  });

  btn.disabled = false; btn.textContent = "✓ Guardar mi elección";

  if (res.ok) {
    msgEl.textContent = "¡Guardado! Ya puedes verlo en la pestaña Resultados.";
    msgEl.className = "msg ok"; msgEl.style.display = "block";
    await loadState();
  } else {
    const data = await res.json().catch(() => ({}));
    msgEl.textContent = data.error || "No se ha podido guardar. Inténtalo de nuevo.";
    msgEl.className = "msg error"; msgEl.style.display = "block";
  }
});

// ---------------------------------------------------------------------------
// RESULTADOS
// ---------------------------------------------------------------------------

function renderResults() {
  const votedCount = Object.keys(state.votes).length;
  document.getElementById("votedBadge").textContent = `${votedCount}/${PEOPLE.length}`;
  document.getElementById("resultsSummary").textContent = `${votedCount} de ${PEOPLE.length} han votado. Los datos se comparten con todo el grupo.`;

  const firstChoiceCounts = {};
  Object.values(state.votes).forEach((v) => {
    if (v.first) firstChoiceCounts[v.first] = (firstChoiceCounts[v.first] || 0) + 1;
  });

  const body = document.getElementById("resultsBody");
  body.innerHTML = PEOPLE.map((person) => {
    const v = state.votes[person];
    const cell = (key) => {
      const id = v?.[key];
      if (!id) return `<td><span style="color:#C4BDD1;">—</span></td>`;
      const villain = villainById[id];
      const conflict = key === "first" && firstChoiceCounts[id] > 1
        ? `<span class="conflict">⚠ coincide</span>` : "";
      return `<td>${villain ? villain.name : id}${conflict}</td>`;
    };
    return `<tr><td style="font-weight:700;">${person}</td>${cell("first")}${cell("second")}${cell("third")}</tr>`;
  }).join("");

  // Ranking de popularidad
  const scores = {};
  Object.values(state.votes).forEach((v) => {
    [v.first, v.second, v.third].forEach((id, i) => {
      if (!id) return;
      const weight = i === 0 ? 3 : i === 1 ? 2 : 1;
      scores[id] = (scores[id] || 0) + weight;
    });
  });
  const ranking = Object.entries(scores)
    .map(([id, score]) => ({ id, score, name: villainById[id]?.name || id }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const popCard = document.getElementById("popularityCard");
  if (ranking.length) {
    popCard.style.display = "block";
    const maxScore = ranking[0].score || 1;
    document.getElementById("popularityList").innerHTML = ranking.map((p) => `
      <div class="pop-row">
        <span class="pop-name">${p.name}</span>
        <div class="pop-bar-bg"><div class="pop-bar-fg" style="width:${(p.score / maxScore) * 100}%;"></div></div>
        <span class="pop-score">${p.score}</span>
      </div>
    `).join("");
  } else {
    popCard.style.display = "none";
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadState);

// ---------------------------------------------------------------------------
// INICIO
// ---------------------------------------------------------------------------

loadState();
