/* ============================================================
   TAREAS — solo interfaz (datos de ejemplo)
   Reutiliza la lógica de ../script.js: usuario, menú móvil, cerrar sesión
   ============================================================ */
const RUTA_AVATARES = "../../Iconos/Avatar/";
const av = n => `${RUTA_AVATARES}avatar${n}.png`;

const COLUMNAS = [
  { estado: "iniciar",   nombre: "Por iniciar" },
  { estado: "proceso",   nombre: "En proceso" },
  { estado: "revision",  nombre: "En revisión" },
  { estado: "terminada", nombre: "Terminadas" }
];
const ETIQUETAS = ["Frontend", "Backend", "QA", "Security", "DevOps", "Docs", "Diseño"];
const EQUIPO = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "Ana López" },
  { id: 3, nombre: "Carlos Ruiz" },
  { id: 4, nombre: "María Gómez" }
];

// TODO: reemplazar por datos de Supabase
let siguienteId = 2;
const TAREAS = [
  {
    id: 1, t: "Ejemplo", tag: "Frontend", e: "iniciar", av: [1, 2, 3],
    f: new Date().toISOString().slice(0, 10), d: 3,
    com: [{ n: "Ana López", a: 2, txt: "Arrástrame a otra columna para cambiar el estado.", h: "Ahora" }]
  }
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const fmtFecha = iso => iso
  ? new Date(iso + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
  : "Sin fecha";
const fmtDias = n => `${n} ${n === 1 ? "día" : "días"}`;

function cardTarea(x) {
  const vis = x.av.slice(0, 3);
  const extra = x.av.length - vis.length;
  const avatares = vis.map(n => `<img src="${av(n)}" alt="">`).join("") +
                   (extra > 0 ? `<span class="more">+${extra}</span>` : "");
  return `
    <article class="card-tarea" data-id="${x.id}">
      <h3 class="ct-title">${esc(x.t)}</h3>
      <span class="tag tag-${esc(x.tag)}">${esc(x.tag)}</span>
      <div class="ct-row">
        <div class="avatars">${avatares}</div>
        <div class="ct-date"><b>${esc(fmtFecha(x.f))}</b><br>${fmtDias(x.d)}</div>
      </div>
      <div class="ct-foot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>
        <span><span class="ct-clabel">Comentarios </span>(${x.com.length})</span>
      </div>
    </article>`;
}

function renderTablero() {
  document.getElementById("board").innerHTML = COLUMNAS.map(col => {
    const items = TAREAS.filter(x => x.e === col.estado);
    return `
      <div class="col" data-estado="${col.estado}">
        <div class="col-head">
          <span class="col-dot"></span>
          <span class="col-name">${col.nombre}</span>
          <span class="col-count">${items.length}</span>
        </div>
        ${items.map(cardTarea).join("") || '<div class="col-empty">Sin tareas</div>'}
      </div>`;
  }).join("");
}

/* ---------- Arrastrar tarjetas entre columnas (mouse y táctil) ---------- */
function inicializarArrastre() {
  const board = document.getElementById("board");
  let st = null;

  const colBajo = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest(".col") : null;
  };
  const limpiar = () => {
    board.querySelectorAll(".col.drop-over").forEach(c => c.classList.remove("drop-over"));
  };

  board.addEventListener("pointerdown", e => {
    const card = e.target.closest(".card-tarea");
    if (!card || (e.pointerType === "mouse" && e.button !== 0)) return;
    st = { card, id: +card.dataset.id, x0: e.clientX, y0: e.clientY, drag: false, ghost: null, dx: 0, dy: 0 };
  });

  window.addEventListener("pointermove", e => {
    if (!st) return;
    if (!st.drag) {
      if (Math.hypot(e.clientX - st.x0, e.clientY - st.y0) < 6) return;
      st.drag = true;
      const r = st.card.getBoundingClientRect();
      st.dx = st.x0 - r.left; st.dy = st.y0 - r.top;
      st.ghost = st.card.cloneNode(true);
      st.ghost.classList.add("card-ghost");
      st.ghost.style.width = r.width + "px";
      document.body.appendChild(st.ghost);
      st.card.classList.add("dragging");
    }
    st.ghost.style.left = (e.clientX - st.dx) + "px";
    st.ghost.style.top = (e.clientY - st.dy) + "px";
    limpiar();
    const c = colBajo(e.clientX, e.clientY);
    if (c) c.classList.add("drop-over");
  });

  const fin = (e, cancelado) => {
    if (!st) return;
    const s = st; st = null;
    limpiar();
    if (!s.drag) { if (!cancelado) abrirModal(s.id); return; }
    s.ghost.remove();
    const c = cancelado ? null : colBajo(e.clientX, e.clientY);
    const t = TAREAS.find(x => x.id === s.id);
    if (c && t) t.e = c.dataset.estado;
    renderTablero();
  };
  window.addEventListener("pointerup", e => fin(e, false));
  window.addEventListener("pointercancel", e => fin(e, true));
}

/* ---------- Popup: nueva tarea / detalle (asignados + comentarios) ---------- */
let borrador = null;   // copia de la tarea en edición
let editando = false;

function usuarioComentario() {
  const u = usuarioSesion() || {};
  const m = u.avatar_file ? RUTA_AVATARES + u.avatar_file : av(1);
  return { n: u.nombre || "Tú", src: m };
}

function renderAsignados() {
  document.getElementById("fAsignados").innerHTML = EQUIPO.map(m => `
    <button type="button" class="assign-opt ${borrador.av.includes(m.id) ? "on" : ""}" data-m="${m.id}">
      <img src="${av(m.id)}" alt=""> ${esc(m.nombre)}
    </button>`).join("");
}

function renderComentarios() {
  const box = document.getElementById("fComentarios");
  box.innerHTML = borrador.com.map(c => `
    <div class="comment">
      <img src="${esc(c.src || av(c.a || 1))}" alt="">
      <div><b>${esc(c.n)}</b><small>${esc(c.h)}</small><p>${esc(c.txt)}</p></div>
    </div>`).join("") || '<span class="comments-empty">Sin comentarios todavía.</span>';
  box.scrollTop = box.scrollHeight;
}

function abrirModal(id) {
  const t = id ? TAREAS.find(x => x.id === id) : null;
  editando = !!t;
  borrador = t
    ? { ...t, av: [...t.av], com: t.com.map(c => ({ ...c })) }
    : { id: 0, t: "", tag: ETIQUETAS[0], e: "iniciar", av: [], f: new Date().toISOString().slice(0, 10), d: 1, com: [] };

  document.getElementById("modalTitulo").textContent = editando ? "Detalle de tarea" : "Nueva tarea";
  document.getElementById("fTitulo").value = borrador.t;
  document.getElementById("fTag").value = borrador.tag;
  document.getElementById("fEstado").value = borrador.e;
  document.getElementById("fFecha").value = borrador.f;
  document.getElementById("fDias").value = borrador.d;
  document.getElementById("fNuevoComentario").value = "";
  document.getElementById("btnEliminar").style.display = editando ? "" : "none";
  renderAsignados();
  renderComentarios();

  const m = document.getElementById("modal");
  m.classList.add("show"); m.setAttribute("aria-hidden", "false");
  setTimeout(() => document.getElementById("fTitulo").focus(), 50);
}

function cerrarModal() {
  const m = document.getElementById("modal");
  m.classList.remove("show"); m.setAttribute("aria-hidden", "true");
  borrador = null;
}

function inicializarModal() {
  const $ = id => document.getElementById(id);
  $("fTag").innerHTML = ETIQUETAS.map(t => `<option>${t}</option>`).join("");
  $("fEstado").innerHTML = COLUMNAS.map(c => `<option value="${c.estado}">${c.nombre}</option>`).join("");

  $("btnNuevaTarea").addEventListener("click", () => abrirModal(null));
  $("modalCerrar").addEventListener("click", cerrarModal);
  $("btnCancelar").addEventListener("click", cerrarModal);
  $("modal").addEventListener("mousedown", e => { if (e.target.id === "modal") cerrarModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && borrador) cerrarModal(); });

  $("fAsignados").addEventListener("click", e => {
    const b = e.target.closest(".assign-opt");
    if (!b) return;
    const n = +b.dataset.m;
    borrador.av = borrador.av.includes(n) ? borrador.av.filter(x => x !== n) : [...borrador.av, n];
    renderAsignados();
  });

  const comentar = () => {
    const inp = $("fNuevoComentario");
    const txt = inp.value.trim();
    if (!txt) return;
    const u = usuarioComentario();
    borrador.com.push({ n: u.n, src: u.src, txt, h: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) });
    inp.value = "";
    renderComentarios();
  };
  $("btnComentar").addEventListener("click", comentar);
  $("fNuevoComentario").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); comentar(); } });

  $("btnEliminar").addEventListener("click", () => {
    const i = TAREAS.findIndex(x => x.id === borrador.id);
    if (i >= 0) TAREAS.splice(i, 1);
    cerrarModal(); renderTablero();
  });

  $("formTarea").addEventListener("submit", e => {
    e.preventDefault();
    const titulo = $("fTitulo").value.trim();
    if (!titulo) return;
    Object.assign(borrador, {
      t: titulo, tag: $("fTag").value, e: $("fEstado").value,
      f: $("fFecha").value, d: Math.max(1, parseInt($("fDias").value, 10) || 1)
    });
    if (editando) {
      TAREAS[TAREAS.findIndex(x => x.id === borrador.id)] = borrador;
    } else {
      borrador.id = siguienteId++;
      TAREAS.push(borrador);
    }
    cerrarModal(); renderTablero();
  });
}

/* ---------- Usuario (header) ---------- */
function usuarioSesion() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem("rovant_user");
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignorar */ }
  }
  return null;
}

function renderHeaderUsuario() {
  const u = usuarioSesion();
  if (!u) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.textContent = v; };
  set("headerUserName", u.nombre);
  set("headerUserRole", u.cargo);
  const img = document.getElementById("headerAvatar");
  if (img && u.avatar_file) img.src = RUTA_AVATARES + u.avatar_file;
}

/* ---------- Cerrar sesión ---------- */
function inicializarCerrarSesion() {
  const btn = document.getElementById("btnCerrarSesion");
  if (!btn) return;
  btn.addEventListener("click", e => {
    e.preventDefault();
    ["rovant_user", "nombreUsuario", "usuario"].forEach(k => { sessionStorage.removeItem(k); localStorage.removeItem(k); });
    ["rovant_userId", "rovant_userUsuario"].forEach(k => localStorage.removeItem(k));
    window.location.href = "../../index.html";
  });
}

/* ---------- Menú móvil + arrastre (igual que ../script.js) ---------- */
function inicializarMenuMovil() {
  const sidebar = document.getElementById("sidebar");
  const userInfo = document.getElementById("userInfoToggle");
  const overlay = document.getElementById("menuOverlay");
  const handle = document.getElementById("sidebarDragHandle");
  if (!sidebar) return;

  const abrir = () => { sidebar.classList.add("open"); overlay.classList.add("show"); document.body.classList.add("menu-open"); document.body.style.overflow = "hidden"; };
  const cerrar = () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); document.body.classList.remove("menu-open"); document.body.style.overflow = ""; };

  userInfo.addEventListener("click", e => {
    if (window.innerWidth <= 1100) { e.stopPropagation(); sidebar.classList.contains("open") ? cerrar() : abrir(); }
  });
  overlay.addEventListener("click", cerrar);
  sidebar.querySelectorAll(".nav-item").forEach(i => i.addEventListener("click", () => { if (window.innerWidth <= 1100) cerrar(); }));
  window.addEventListener("resize", () => { if (window.innerWidth > 1100) cerrar(); });

  if (!handle) return;
  let startX = 0, currentX = 0, dragging = false;
  const x = e => (e.touches ? e.touches[0].clientX : e.clientX);
  const onStart = e => { if (window.innerWidth > 1100) return; dragging = true; startX = currentX = x(e); sidebar.style.transition = "none"; };
  const onMove = e => {
    if (!dragging) return;
    currentX = x(e);
    const d = currentX - startX;
    if (d < 0) return;
    sidebar.style.transform = `translateX(${d}px)`;
    overlay.style.opacity = Math.max(0, 0.5 - (d / 300) * 0.5);
    if (e.cancelable) e.preventDefault();
  };
  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    const d = currentX - startX;
    sidebar.style.transition = ""; sidebar.style.transform = ""; overlay.style.opacity = "";
    if (d > 80) cerrar();
  };
  handle.addEventListener("touchstart", onStart, { passive: true });
  handle.addEventListener("touchmove", onMove, { passive: false });
  handle.addEventListener("touchend", onEnd);
  handle.addEventListener("touchcancel", onEnd);
  handle.addEventListener("mousedown", onStart);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onEnd);
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeaderUsuario();
  renderTablero();
  inicializarCerrarSesion();
  inicializarMenuMovil();
  inicializarArrastre();
  inicializarModal();
});
