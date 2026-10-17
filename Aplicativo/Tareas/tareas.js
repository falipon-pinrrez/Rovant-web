/* ============================================================
   TAREAS — solo interfaz (datos de ejemplo)
   Reutiliza la lógica de ../script.js: usuario, menú móvil, cerrar sesión
   ============================================================ */
const RUTA_AVATARES = "../../Iconos/Avatar/";
const AVATARES_DEFECTO = [1, 2, 3, 4].map(n => `${RUTA_AVATARES}avatar${n}.png`);

const COLUMNAS = [
  { estado: "iniciar",   nombre: "Por iniciar" },
  { estado: "proceso",   nombre: "En proceso" },
  { estado: "revision",  nombre: "En revisión" },
  { estado: "terminada", nombre: "Terminadas" }
];
const ETIQUETAS = ["Frontend", "Backend", "QA", "Security", "DevOps", "Docs", "Diseño"];

// Se llenan desde Supabase
let EQUIPO = [];      // { id, nombre, cargo, avatar }
let TAREAS = [];      // { id, t, tag, e, av:[userId], f, d, com:[] }

const av = id => {
  const i = EQUIPO.findIndex(m => String(m.id) === String(id));
  return i >= 0 ? EQUIPO[i].avatar : AVATARES_DEFECTO[0];
};
const nombreDe = id => (EQUIPO.find(m => String(m.id) === String(id)) || {}).nombre || "Usuario";

function aviso(msg, error = true) {
  let el = document.getElementById("avisoTareas");
  if (!el) {
    el = document.createElement("div");
    el.id = "avisoTareas";
    document.querySelector(".tareas-main").prepend(el);
  }
  el.className = "aviso" + (error ? " aviso-error" : "");
  el.textContent = msg;
  el.style.display = msg ? "" : "none";
}
function errorDb(e) {
  console.error(e);
  const falta = e && (e.code === "PGRST205" || /relation .* does not exist/.test(e.message || ""));
  aviso(falta
    ? "Faltan las tablas de tareas en Supabase. Ejecuta Aplicativo/Tareas/tareas.sql en el SQL Editor."
    : "Error con la base de datos: " + ((e && e.message) || e));
}

const aTarea = (r, coms) => ({
  id: r.id, t: r.titulo, tag: r.etiqueta, e: r.estado, av: r.asignados || [],
  f: r.fecha || "", d: r.dias || 1,
  com: (coms || []).map(c => ({
    id: c.id, uid: c.user_id, n: c.autor, txt: c.texto,
    h: new Date(c.created_at).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
  }))
});

async function cargarEquipo() {
  const [u, c] = await Promise.all([
    supabaseClient.from("usuarios_rovant").select("id, nombre, cargo, usuario"),
    supabaseClient.from("configuracion_usuario").select("user_id, avatar_url")
  ]);
  if (u.error) throw u.error;
  const cfg = {};
  (c.data || []).forEach(x => { cfg[x.user_id] = x.avatar_url; });
  EQUIPO = (u.data || []).map((m, i) => {
    const f = cfg[m.id];
    const avatar = f ? (/^(\.\.\/|http)/.test(f) ? f : RUTA_AVATARES + f) : AVATARES_DEFECTO[i % 4];
    return { ...m, avatar };
  });
}

async function cargarTareas() {
  const [t, c] = await Promise.all([
    supabaseClient.from("tareas_rovant").select("*").order("created_at"),
    supabaseClient.from("comentarios_tarea").select("*").order("created_at")
  ]);
  if (t.error) throw t.error;
  if (c.error) throw c.error;
  TAREAS = (t.data || []).map(r => aTarea(r, (c.data || []).filter(x => x.tarea_id === r.id)));
}

async function refrescar() {
  try { await cargarTareas(); aviso(""); renderTablero(); } catch (e) { errorDb(e); }
}

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
  const avatares = vis.map(n => `<img src="${av(n)}" alt="${esc(nombreDe(n))}" title="${esc(nombreDe(n))}">`).join("") +
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
        <button type="button" class="ct-del" data-del="${x.id}" title="Eliminar tarea" aria-label="Eliminar tarea">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
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
    if (!card || e.target.closest(".ct-del") || (e.pointerType === "mouse" && e.button !== 0)) return;
    st = { card, id: card.dataset.id, x0: e.clientX, y0: e.clientY, drag: false, ghost: null, dx: 0, dy: 0 };
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
    if (c && t && t.e !== c.dataset.estado) {
      const previo = t.e;
      t.e = c.dataset.estado;
      renderTablero();
      supabaseClient.from("tareas_rovant")
        .update({ estado: t.e, updated_at: new Date().toISOString() }).eq("id", t.id)
        .then(({ error }) => { if (error) { t.e = previo; renderTablero(); errorDb(error); } });
      return;
    }
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
  return { uid: u.id || null, n: u.nombre || "Tú", src: u.id ? av(u.id) : AVATARES_DEFECTO[0] };
}

async function borrarTarea(id) {
  if (!confirm("¿Eliminar esta tarea?")) return false;
  const { error } = await supabaseClient.from("tareas_rovant").delete().eq("id", id);
  if (error) { errorDb(error); return false; }
  TAREAS = TAREAS.filter(x => x.id !== id);
  renderTablero();
  return true;
}

function renderAsignados() {
  document.getElementById("fAsignados").innerHTML = EQUIPO.map(m => `
    <button type="button" class="assign-opt ${borrador.av.includes(m.id) ? "on" : ""}" data-m="${m.id}">
      <img src="${esc(m.avatar)}" alt=""> ${esc(m.nombre)}
    </button>`).join("");
}

function renderComentarios() {
  const box = document.getElementById("fComentarios");
  box.innerHTML = borrador.com.map(c => `
    <div class="comment">
      <img src="${esc(c.src || av(c.uid))}" alt="">
      <div><b>${esc(c.n)}</b><small>${esc(c.h)}</small><p>${esc(c.txt)}</p></div>
    </div>`).join("") || '<span class="comments-empty">Sin comentarios todavía.</span>';
  box.scrollTop = box.scrollHeight;
}

function abrirModal(id) {
  const t = id ? TAREAS.find(x => x.id === id) : null;
  editando = !!t;
  borrador = t
    ? { ...t, av: [...t.av], com: t.com.map(c => ({ ...c })) }
    : { id: null, t: "", tag: ETIQUETAS[0], e: "iniciar", av: [], f: new Date().toISOString().slice(0, 10), d: 1, com: [] };

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

  $("fAsignados").addEventListener("click", async e => {
    const b = e.target.closest(".assign-opt");
    if (!b) return;
    const n = +b.dataset.m;
    borrador.av = borrador.av.includes(n) ? borrador.av.filter(x => x !== n) : [...borrador.av, n];
    renderAsignados();
    if (editando) {
      const { error } = await supabaseClient.from("tareas_rovant")
        .update({ asignados: borrador.av, updated_at: new Date().toISOString() }).eq("id", borrador.id);
      if (error) return errorDb(error);
      const t = TAREAS.find(x => x.id === borrador.id);
      if (t) t.av = [...borrador.av];
      renderTablero();
    }
  });

  const comentar = async () => {
    const inp = $("fNuevoComentario");
    const txt = inp.value.trim();
    if (!txt) return;
    const u = usuarioComentario();
    const com = { uid: u.uid, n: u.n, src: u.src, txt, h: "Ahora" };
    if (editando) {
      const { data, error } = await supabaseClient.from("comentarios_tarea")
        .insert({ tarea_id: borrador.id, user_id: u.uid, autor: u.n, texto: txt }).select().single();
      if (error) return errorDb(error);
      com.id = data.id;
      const t = TAREAS.find(x => x.id === borrador.id);
      if (t) t.com.push({ ...com });
      renderTablero();
    }
    borrador.com.push(com);
    inp.value = "";
    renderComentarios();
  };
  $("btnComentar").addEventListener("click", comentar);
  $("fNuevoComentario").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); comentar(); } });

  $("btnEliminar").addEventListener("click", async () => {
    if (await borrarTarea(borrador.id)) cerrarModal();
  });
  $("board").addEventListener("click", e => {
    const b = e.target.closest(".ct-del");
    if (b) borrarTarea(b.dataset.del);
  });

  $("formTarea").addEventListener("submit", async e => {
    e.preventDefault();
    const titulo = $("fTitulo").value.trim();
    if (!titulo) return;
    const campos = {
      titulo, etiqueta: $("fTag").value, estado: $("fEstado").value,
      fecha: $("fFecha").value || null,
      dias: Math.max(1, parseInt($("fDias").value, 10) || 1),
      asignados: borrador.av
    };
    $("btnGuardar").disabled = true;
    try {
      if (editando) {
        const { error } = await supabaseClient.from("tareas_rovant")
          .update({ ...campos, updated_at: new Date().toISOString() }).eq("id", borrador.id);
        if (error) throw error;
      } else {
        const u = usuarioSesion() || {};
        const { data, error } = await supabaseClient.from("tareas_rovant")
          .insert({ ...campos, creado_por: u.id || null }).select().single();
        if (error) throw error;
        if (borrador.com.length) {
          await supabaseClient.from("comentarios_tarea").insert(borrador.com.map(c => ({
            tarea_id: data.id, user_id: c.uid, autor: c.n, texto: c.txt })));
        }
      }
      cerrarModal();
      await refrescar();
    } catch (err) { errorDb(err); }
    finally { $("btnGuardar").disabled = false; }
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
  if (img && u.id && EQUIPO.length) img.src = av(u.id);
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

document.addEventListener("DOMContentLoaded", async () => {
  renderTablero();
  inicializarCerrarSesion();
  inicializarMenuMovil();
  inicializarArrastre();
  inicializarModal();
  renderHeaderUsuario();
  try {
    await cargarEquipo();
    renderHeaderUsuario();
    await cargarTareas();
    renderTablero();
  } catch (e) { errorDb(e); }
  // Sincroniza cambios de otros usuarios
  setInterval(() => {
    if (!document.hidden && !borrador && !document.querySelector(".card-ghost")) refrescar();
  }, 20000);
});
