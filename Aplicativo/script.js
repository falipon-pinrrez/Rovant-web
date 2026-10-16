/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */
let usuarioActual = null;
let usuariosEquipo = [];
let tareas = [];

let tabActiva = "grupo";

/* ============================================================
   AVATAR POR DEFECTO (rotativo)
   ============================================================ */
function obtenerAvatar(index) {
  const avatares = [
    "../Iconos/avatar1.png",
    "../Iconos/avatar2.png",
    "../Iconos/avatar3.png",
    "../Iconos/avatar4.png"
  ];
  return avatares[index % avatares.length];
}

/* ============================================================
   RENDER DE TAREAS
   ============================================================ */
function renderTareas() {
  const contenedor = document.getElementById("taskList");
  if (!contenedor) return;

  let filtradas = tareas;

  if (tabActiva === "completas") {
    filtradas = tareas.filter(t => t.estado === "Realizado");
  } else if (tabActiva === "mis") {
    filtradas = tareas.filter(t => t.estado === "En Progreso");
  }

  // ---- Estado vacío: círculo minimalista con tabla + check ----
  if (filtradas.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state empty-state-tasks">
        <div class="empty-circle">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Tabla / lista -->
            <rect x="4" y="4" width="16" height="16" rx="2"
                  stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            <line x1="4" y1="9" x2="20" y2="9"
                  stroke="currentColor" stroke-width="1.6"/>
            <line x1="4" y1="14" x2="20" y2="14"
                  stroke="currentColor" stroke-width="1.6"/>
            <line x1="10" y1="4" x2="10" y2="20"
                  stroke="currentColor" stroke-width="1.6"/>
            <!-- Check dentro -->
            <polyline points="12.5 16.5 14 18 17 14.5"
                      stroke="currentColor" stroke-width="1.8"
                      stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <p class="empty-text">No hay tareas</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = filtradas.map(t => `
    <div class="task-item">
      <div class="task-name-row">
        <span class="task-name">${t.nombre}</span>
        <span class="task-badge ${t.badge}">${t.estado}</span>
      </div>
      <div class="task-meta">
        <img src="../Iconos/calendario.png" alt="Fecha">
        <span class="meta-text">${t.fecha}</span>
        <img src="${t.avatar}" alt="${t.persona}" class="meta-avatar">
        <span class="meta-text">${t.persona}</span>
      </div>
    </div>
  `).join("");
}

/* ============================================================
   TABS DE TAREAS
   ============================================================ */
function inicializarTabs() {
  document.querySelectorAll(".task-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".task-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tabActiva = btn.dataset.tab;
      renderTareas();
    });
  });
}

/* ============================================================
   NAVEGACIÓN SIDEBAR
   ============================================================ */
function inicializarNavegacion() {
  document.querySelectorAll(".nav-item").forEach(item => {
    // Ignoramos el botón de cerrar sesión aquí (tiene su propia lógica)
    if (item.id === "btnCerrarSesion") return;

    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

/* ============================================================
   CERRAR SESIÓN
   Limpia el storage y redirige al index.html de la raíz
   ============================================================ */
function inicializarCerrarSesion() {
  const btnCerrar = document.getElementById("btnCerrarSesion");
  if (!btnCerrar) return;

  btnCerrar.addEventListener("click", (e) => {
    e.preventDefault();

    // 1. Limpiar datos de sesión (sessionStorage)
    sessionStorage.removeItem("rovant_user");
    sessionStorage.removeItem("nombreUsuario");
    sessionStorage.removeItem("usuario");

    // 2. Limpiar también localStorage por si acaso
    localStorage.removeItem("rovant_user");
    localStorage.removeItem("rovant_userId");
    localStorage.removeItem("rovant_userUsuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("usuario");

    // 3. Redirigir al index.html (está fuera de la carpeta Login)
    window.location.href = "../index.html";
  });
}

/* ============================================================
   RENDER USUARIO ACTUAL EN EL HEADER Y BIENVENIDA
   ============================================================ */
function renderUsuarioActual(u, index = 0) {
  if (!u) return;

  const nombre = u.nombre || "Usuario";
  const cargo = u.cargo || "Sin cargo";
  const avatar = obtenerAvatar(index);

  const headerName = document.getElementById("headerUserName");
  const headerRole = document.getElementById("headerUserRole");
  const headerAvatar = document.getElementById("headerAvatar");
  const welcomeName = document.getElementById("welcomeUserName");

  if (headerName) headerName.textContent = nombre;
  if (headerRole) headerRole.textContent = cargo;
  if (headerAvatar) headerAvatar.src = avatar;
  if (welcomeName) welcomeName.textContent = nombre;
}

/* ============================================================
   RENDER LISTA DE MIEMBROS DEL EQUIPO
   ============================================================ */
function renderEquipo(lista) {
  const contenedor = document.querySelector(".team-list");
  if (!contenedor) return;

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = '<div style="text-align:center;color:#999;font-size:12px;padding:20px 0;">Sin miembros</div>';
    return;
  }

  contenedor.innerHTML = lista.map((u, i) => {
    const nombre = u.nombre || "Usuario";
    const cargo = u.cargo || "Sin cargo";
    const avatar = obtenerAvatar(i);

    return `
      <div class="team-member">
        <img src="${avatar}" alt="${nombre}" class="tm-avatar">
        <div class="tm-info">
          <span class="tm-name">${nombre}</span>
          <span class="tm-role">${cargo}</span>
        </div>
      </div>
    `;
  }).join("");
}

/* ============================================================
   OBTENER USUARIO LOGUEADO
   ============================================================ */
function obtenerUsuarioLogueado() {
  // ---- 1. Intento principal: sessionStorage.rovant_user ----
  try {
    const rovantUserStr = sessionStorage.getItem("rovant_user");
    if (rovantUserStr) {
      const userObj = JSON.parse(rovantUserStr);
      console.log("✅ Usuario logueado encontrado:", userObj);
      return userObj;
    }
  } catch (e) {
    console.warn("⚠️ Error al parsear rovant_user:", e);
  }

  // ---- 2. Intento en localStorage ----
  try {
    const rovantUserStrLS = localStorage.getItem("rovant_user");
    if (rovantUserStrLS) {
      const userObj = JSON.parse(rovantUserStrLS);
      console.log("✅ Usuario logueado encontrado (localStorage):", userObj);
      return userObj;
    }
  } catch (e) {
    console.warn("⚠️ Error al parsear rovant_user de localStorage:", e);
  }

  // ---- 3. Fallback: nombre de usuario ----
  const nombreAlternativo =
    sessionStorage.getItem("nombreUsuario") ||
    localStorage.getItem("nombreUsuario");

  if (nombreAlternativo) {
    console.log("✅ Usuario encontrado por nombre alternativo:", nombreAlternativo);
    return { nombre: nombreAlternativo };
  }

  console.warn("⚠️ No se encontró usuario logueado en storage");
  return null;
}

/* ============================================================
   CARGAR DATOS DESDE SUPABASE
   ============================================================ */
async function cargarDatosDesdeSupabase() {
  try {
    if (typeof supabaseClient === "undefined") {
      console.warn("⚠️ supabaseClient no está definido. ¿Cargaste config.js?");
      return;
    }

    // ===== 1. TRAER TODOS LOS USUARIOS =====
    const { data: usuarios, error: errUsuarios } = await supabaseClient
      .from("usuarios_rovant")
      .select("id, nombre, cargo, usuario");

    if (errUsuarios) {
      console.error("Error al traer usuarios:", errUsuarios);
      return;
    }

    usuariosEquipo = usuarios || [];
    console.log("✅ Usuarios cargados desde Supabase:", usuariosEquipo);

    // ===== 2. IDENTIFICAR AL USUARIO ACTUAL =====
    const usuarioLogueado = obtenerUsuarioLogueado();

    if (usuarioLogueado && usuarioLogueado.id) {
      usuarioActual = usuariosEquipo.find(u => String(u.id) === String(usuarioLogueado.id));
    }

    if (!usuarioActual && usuarioLogueado && usuarioLogueado.usuario) {
      usuarioActual = usuariosEquipo.find(u => u.usuario === usuarioLogueado.usuario);
    }

    if (!usuarioActual && usuarioLogueado && usuarioLogueado.nombre) {
      usuarioActual = usuariosEquipo.find(u => u.nombre === usuarioLogueado.nombre);
    }

    // Fallback: primer usuario
    let indexActual = 0;
    if (!usuarioActual && usuariosEquipo.length > 0) {
      usuarioActual = usuariosEquipo[0];
      indexActual = 0;
      console.warn("⚠️ No se encontró coincidencia, usando el primero:", usuarioActual.nombre);
    } else if (usuarioActual) {
      indexActual = usuariosEquipo.indexOf(usuarioActual);
    }

    // ===== 3. RENDERIZAR USUARIO ACTUAL =====
    if (usuarioActual) {
      renderUsuarioActual(usuarioActual, indexActual);
    }

    // ===== 4. RENDERIZAR EQUIPO =====
    renderEquipo(usuariosEquipo);

    // ===== 5. TAREAS =====
    tareas = [];
    renderTareas();

  } catch (err) {
    console.error("Error general al cargar datos:", err);
  }
}

/* ============================================================
   MENÚ DESPLEGABLE MÓVIL
   Se abre al hacer clic en el avatar + nombre + cargo
   ============================================================ */
function inicializarMenuMovil() {
  const sidebar = document.querySelector(".sidebar");
  const userInfo = document.getElementById("userInfoToggle");
  const overlay = document.getElementById("menuOverlay");

  if (!sidebar) return;

  const abrirMenu = () => {
    sidebar.classList.add("open");
    if (overlay) overlay.classList.add("show");
    document.body.classList.add("menu-open");
    document.body.style.overflow = "hidden";
  };

  const cerrarMenu = () => {
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
  };

  // Abrir/cerrar desde el avatar/nombre del usuario
  if (userInfo) {
    userInfo.addEventListener("click", (e) => {
      if (window.innerWidth <= 1100) {
        e.stopPropagation();
        sidebar.classList.contains("open") ? cerrarMenu() : abrirMenu();
      }
    });
  }

  // Cerrar al tocar el overlay
  if (overlay) {
    overlay.addEventListener("click", cerrarMenu);
  }

  // Cerrar al hacer clic en cualquier nav-item
  sidebar.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1100) cerrarMenu();
    });
  });

  // Cerrar al salir del rango móvil
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) cerrarMenu();
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  inicializarTabs();
  inicializarNavegacion();
  inicializarCerrarSesion();
  inicializarMenuMovil();

  await cargarDatosDesdeSupabase();
});