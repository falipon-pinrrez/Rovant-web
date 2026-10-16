/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */
let usuarioActual = null;
let usuariosEquipo = [];
let tareas = [];
let configuracionUsuario = null;
let tabActiva = "grupo";

/* ============================================================
   AVATAR POR DEFECTO (rotativo)
   ============================================================ */
function obtenerAvatar(index) {
  const avatares = [
    "../Iconos/Avatar/avatar1.png",
    "../Iconos/Avatar/avatar2.png",
    "../Iconos/Avatar/avatar3.png",
    "../Iconos/Avatar/avatar4.png"
  ];
  return avatares[index % avatares.length];
}

/* ============================================================
   OBTENER RUTA DEL AVATAR GUARDADO
   ============================================================ */
function obtenerAvatarUsuario(index = 0) {
  // 1) Si hay configuración guardada con avatar
  if (configuracionUsuario && configuracionUsuario.avatar_url) {
    const file = configuracionUsuario.avatar_url;

    if (file.startsWith('../') || file.startsWith('http')) {
      return file;
    }
    return '../Iconos/Avatar/' + file;
  }

  // 2) Si el login guardó avatar en sessionStorage
  try {
    const sesionRaw = sessionStorage.getItem('rovant_user');
    if (sesionRaw) {
      const s = JSON.parse(sesionRaw);
      if (s.avatar_file) return '../Iconos/Avatar/' + s.avatar_file;
      if (s.avatar_url && (s.avatar_url.startsWith('../') || s.avatar_url.startsWith('http'))) {
        return s.avatar_url;
      }
    }
  } catch (e) { /* ignorar */ }

  // 3) Fallback: avatar rotativo
  return obtenerAvatar(index);
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

  if (filtradas.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state empty-state-tasks">
        <div class="empty-circle">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2"
                  stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            <line x1="4" y1="9" x2="20" y2="9"
                  stroke="currentColor" stroke-width="1.6"/>
            <line x1="4" y1="14" x2="20" y2="14"
                  stroke="currentColor" stroke-width="1.6"/>
            <line x1="10" y1="4" x2="10" y2="20"
                  stroke="currentColor" stroke-width="1.6"/>
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
    if (item.id === "btnCerrarSesion") return;

    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

/* ============================================================
   CERRAR SESIÓN
   ============================================================ */
function inicializarCerrarSesion() {
  const btnCerrar = document.getElementById("btnCerrarSesion");
  if (!btnCerrar) return;

  btnCerrar.addEventListener("click", (e) => {
    e.preventDefault();

    sessionStorage.removeItem("rovant_user");
    sessionStorage.removeItem("nombreUsuario");
    sessionStorage.removeItem("usuario");

    localStorage.removeItem("rovant_user");
    localStorage.removeItem("rovant_userId");
    localStorage.removeItem("rovant_userUsuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("usuario");

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
  const avatar = obtenerAvatarUsuario(index);

  const headerName = document.getElementById("headerUserName");
  const headerRole = document.getElementById("headerUserRole");
  const headerAvatar = document.getElementById("headerAvatar");
  const welcomeName = document.getElementById("welcomeUserName");

  if (headerName) headerName.textContent = nombre;
  if (headerRole) headerRole.textContent = cargo;
  if (headerAvatar) headerAvatar.src = avatar;
  if (welcomeName) welcomeName.textContent = nombre;

  console.log("👤 Avatar del header aplicado:", avatar);
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

    // Si el usuario de la lista es el logueado, usar SU avatar guardado
    const esYo = usuarioActual && String(u.id) === String(usuarioActual.id);
    const avatar = esYo ? obtenerAvatarUsuario(i) : obtenerAvatar(i);

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
   CARGAR CONFIGURACIÓN DEL USUARIO (avatar guardado)
   ============================================================ */
async function cargarConfiguracionUsuario(userId) {
  if (!userId) return null;

  try {
    if (typeof supabaseClient === "undefined") {
      console.warn("⚠️ supabaseClient no está definido");
      return null;
    }

    const { data, error } = await supabaseClient
      .from("configuracion_usuario")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("No se pudo cargar configuración:", error.message);
      return null;
    }

    if (data) {
      console.log("✅ Configuración del usuario cargada:", data);
      return data;
    } else {
      console.log("ℹ️ El usuario no tiene configuración guardada aún");
      return null;
    }
  } catch (e) {
    console.warn("Error cargando configuración:", e);
    return null;
  }
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

    // 1) Usuario logueado
    const usuarioLogueado = obtenerUsuarioLogueado();

    // 2) Configuración (avatar guardado) ANTES de renderizar
    if (usuarioLogueado && usuarioLogueado.id) {
      configuracionUsuario = await cargarConfiguracionUsuario(usuarioLogueado.id);
    }

    // 3) Lista de usuarios del equipo
    const { data: usuarios, error: errUsuarios } = await supabaseClient
      .from("usuarios_rovant")
      .select("id, nombre, cargo, usuario");

    if (errUsuarios) {
      console.error("Error al traer usuarios:", errUsuarios);
      return;
    }

    usuariosEquipo = usuarios || [];
    console.log("✅ Usuarios cargados desde Supabase:", usuariosEquipo);

    // 4) Encontrar usuario actual
    if (usuarioLogueado && usuarioLogueado.id) {
      usuarioActual = usuariosEquipo.find(u => String(u.id) === String(usuarioLogueado.id));
    }

    if (!usuarioActual && usuarioLogueado && usuarioLogueado.usuario) {
      usuarioActual = usuariosEquipo.find(u => u.usuario === usuarioLogueado.usuario);
    }

    if (!usuarioActual && usuarioLogueado && usuarioLogueado.nombre) {
      usuarioActual = usuariosEquipo.find(u => u.nombre === usuarioLogueado.nombre);
    }

    let indexActual = 0;
    if (!usuarioActual && usuariosEquipo.length > 0) {
      usuarioActual = usuariosEquipo[0];
      indexActual = 0;
      console.warn("⚠️ No se encontró coincidencia, usando el primero:", usuarioActual.nombre);
    } else if (usuarioActual) {
      indexActual = usuariosEquipo.indexOf(usuarioActual);
    }

    // 5) Renderizar usuario actual
    if (usuarioActual) {
      renderUsuarioActual(usuarioActual, indexActual);
    }

    // 6) Renderizar equipo
    renderEquipo(usuariosEquipo);

    // 7) Tareas (vacío por ahora)
    tareas = [];
    renderTareas();

  } catch (err) {
    console.error("Error general al cargar datos:", err);
  }
}

/* ============================================================
   MENÚ DESPLEGABLE MÓVIL
   ============================================================ */
function inicializarMenuMovil() {
  const sidebar = document.getElementById("sidebar");
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

  if (userInfo) {
    userInfo.addEventListener("click", (e) => {
      if (window.innerWidth <= 1100) {
        e.stopPropagation();
        sidebar.classList.contains("open") ? cerrarMenu() : abrirMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", cerrarMenu);
  }

  sidebar.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1100) cerrarMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) cerrarMenu();
  });
}

/* ============================================================
   ARRASTRE DEL MENÚ (swipe para cerrar)
   ============================================================ */
function inicializarArrastreMenu() {
  const sidebar = document.getElementById("sidebar");
  const handle = document.getElementById("sidebarDragHandle");
  const overlay = document.getElementById("menuOverlay");

  if (!sidebar || !handle) return;

  let startX = 0;
  let currentX = 0;
  let dragging = false;
  const umbralCierre = 80;

  const onStart = (e) => {
    if (window.innerWidth > 1100) return;
    dragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    currentX = startX;
    sidebar.style.transition = "none";
  };

  const onMove = (e) => {
    if (!dragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX);
    const delta = currentX - startX;

    if (delta < 0) return;

    sidebar.style.transform = `translateX(${delta}px)`;

    if (overlay) {
      const opacidad = Math.max(0, 0.5 - (delta / 300) * 0.5);
      overlay.style.opacity = opacidad;
    }

    if (e.cancelable) e.preventDefault();
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;

    const delta = currentX - startX;
    sidebar.style.transition = "";
    sidebar.style.transform = "";
    if (overlay) overlay.style.opacity = "";

    if (delta > umbralCierre) {
      sidebar.classList.remove("open");
      if (overlay) overlay.classList.remove("show");
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
    }
  };

  handle.addEventListener("touchstart", onStart, { passive: true });
  handle.addEventListener("touchmove", onMove, { passive: false });
  handle.addEventListener("touchend", onEnd);
  handle.addEventListener("touchcancel", onEnd);

  handle.addEventListener("mousedown", onStart);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onEnd);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  inicializarTabs();
  inicializarNavegacion();
  inicializarCerrarSesion();
  inicializarMenuMovil();
  inicializarArrastreMenu();

  await cargarDatosDesdeSupabase();
});