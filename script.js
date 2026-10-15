// ============================
// COORDENADAS BASE (diseño PC 1512x982)
// ============================
const BASE = {
  W: 1512,
  H: 982,
  cabecera: { h: 70 },
  logoHeader: { x: 70, y: 18, w: 170, h: 36 },
  nav: {
    gap: 40,
    fontSize: 15
  },
  lineaActiva: { h: 3 },
  menuHamburguesa: { x: 1386, y: 20, w: 24, h: 30 },
  logoPrincipal: { x: 146, y: 180, w: 400, h: 86 },
  textoPrincipal: { x: 146, y: 320, w: 520, fontSize: 24 },
  subtitulo: { x: 146, y: 494, fontSize: 16 },
  btnDescarga: { x: 143, y: 594, w: 347, h: 91, fontSize: 20 },
  iconoAndroid: { w: 42, h: 42 },
  iconoDescarga: { w: 32, h: 32 },
  publicidad: { right: 0, y: 120, w: 700 }
};

// ============================
// COORDENADAS MÓVIL (428x926)
// ============================
const MOVIL = {
  W: 428,
  H: 926,
  cabecera: { h: 50 },
  logoHeader: { x: 142, y: 12, w: 100, h: 22 },
  menuHamburguesa: { x: 380, y: 15, w: 18, h: 18 },
  logoPrincipal: { x: 85, y: 90, w: 258, h: 56 },
  textoPrincipal: { x: 52, y: 165, w: 324, fontSize: 16 },
  subtitulo: { x: 52, y: 289, fontSize: 14 },
  btnDescarga: { x: 108, y: 369, w: 212, h: 55, fontSize: 13 },
  iconoAndroid: { w: 26, h: 26 },
  iconoDescarga: { w: 19, h: 20 },
  publicidad: { x: -20, y: 479, w: 430 }
};

// ============================
// PROPORCIÓN REAL DE LA IMAGEN DE PUBLICIDAD
// ============================
let PUB_RATIO = 700 / 657;

// ============================
// APLICAR ESTILOS SEGÚN PANTALLA
// ============================
function ajustar() {
  const ancho = window.innerWidth;
  const esMovil = ancho <= 768;
  const cfg = esMovil ? MOVIL : BASE;

  const sx = ancho / cfg.W;

  // Cabecera
  const cabecera = document.querySelector('.cabecera');
  cabecera.style.height = (cfg.cabecera.h * sx) + 'px';

  // Logo header
  const logoHeader = document.querySelector('.logo-header');
  logoHeader.style.left = (cfg.logoHeader.x * sx) + 'px';
  logoHeader.style.top = (cfg.logoHeader.y * sx) + 'px';
  logoHeader.style.width = (cfg.logoHeader.w * sx) + 'px';
  logoHeader.style.height = (cfg.logoHeader.h * sx) + 'px';

  // Nav + hamburguesa
  const menuPc = document.querySelector('.menu-pc');
  const menuHamb = document.querySelector('.menu-hamburguesa');

  menuHamb.style.display = 'block';
  menuHamb.style.visibility = 'visible';
  menuHamb.style.opacity = '1';
  menuHamb.style.left = (cfg.menuHamburguesa.x * sx) + 'px';
  menuHamb.style.top = (cfg.menuHamburguesa.y * sx) + 'px';
  menuHamb.style.width = (cfg.menuHamburguesa.w * sx) + 'px';
  menuHamb.style.height = (cfg.menuHamburguesa.h * sx) + 'px';

  if (esMovil) {
    menuPc.style.display = 'none';
  } else {
    menuPc.style.display = 'flex';
    menuPc.style.justifyContent = 'center';
    menuPc.style.paddingLeft = '0';
    menuPc.style.paddingRight = '0';
    menuPc.style.gap = (BASE.nav.gap * sx) + 'px';

    document.querySelectorAll('.menu-pc .nav-link').forEach((link) => {
      link.style.fontSize = (BASE.nav.fontSize * sx) + 'px';
    });

    // === CENTRADO ENTRE LOGO Y HAMBURGUESA ===
    const bordeLogo = (BASE.logoHeader.x + BASE.logoHeader.w) * sx;
    const bordeHamb = BASE.menuHamburguesa.x * sx;
    const centroDisponible = (bordeLogo + bordeHamb) / 2;
    const centroViewport = ancho / 2;
    const desplazamiento = centroDisponible - centroViewport;

    if (desplazamiento >= 0) {
      menuPc.style.paddingLeft = desplazamiento + 'px';
      menuPc.style.paddingRight = '0';
    } else {
      menuPc.style.paddingLeft = '0';
      menuPc.style.paddingRight = Math.abs(desplazamiento) + 'px';
    }

    // Línea activa
    const linea = document.querySelector('.linea-activa');
    const activo = document.querySelector('.menu-pc .nav-link.activo');
    if (activo) {
      const rect = activo.getBoundingClientRect();
      const parent = activo.parentElement.getBoundingClientRect();
      linea.style.left = (rect.left - parent.left) + 'px';
      linea.style.width = rect.width + 'px';
      linea.style.height = (BASE.lineaActiva.h * sx) + 'px';
      linea.style.bottom = (8 * sx) + 'px';
    }
  }

  // Logo principal
  const logoPrin = document.querySelector('.logo-principal');
  logoPrin.style.left = (cfg.logoPrincipal.x * sx) + 'px';
  logoPrin.style.top = (cfg.logoPrincipal.y * sx) + 'px';
  logoPrin.style.width = (cfg.logoPrincipal.w * sx) + 'px';
  logoPrin.style.height = (cfg.logoPrincipal.h * sx) + 'px';

  // Texto principal
  const texto = document.querySelector('.texto-principal');
  texto.style.left = (cfg.textoPrincipal.x * sx) + 'px';
  texto.style.top = (cfg.textoPrincipal.y * sx) + 'px';
  texto.style.width = (cfg.textoPrincipal.w * sx) + 'px';
  texto.style.fontSize = (cfg.textoPrincipal.fontSize * sx) + 'px';

  // Subtítulo
  const sub = document.querySelector('.subtitulo');
  sub.style.left = (cfg.subtitulo.x * sx) + 'px';
  sub.style.top = (cfg.subtitulo.y * sx) + 'px';
  sub.style.fontSize = (cfg.subtitulo.fontSize * sx) + 'px';

  // ============================
  // BOTÓN DESCARGA
  // ============================
  const btn = document.querySelector('.btn-descarga');
  const btnW = cfg.btnDescarga.w * sx;
  const btnH = cfg.btnDescarga.h * sx;

  btn.style.left = (cfg.btnDescarga.x * sx) + 'px';
  btn.style.top = (cfg.btnDescarga.y * sx) + 'px';
  btn.style.width = btnW + 'px';
  btn.style.height = btnH + 'px';
  btn.style.fontSize = (cfg.btnDescarga.fontSize * sx) + 'px';
  btn.style.gap = (14 * sx) + 'px';
  btn.style.borderRadius = (btnH / 2) + 'px';

  btn.style.border = 'none';
  btn.style.outline = 'none';
  btn.style.boxShadow = 'none';
  btn.style.background = '#1776F7';
  btn.style.overflow = 'hidden';
  btn.style.webkitAppearance = 'none';
  btn.style.appearance = 'none';

  // Icono Android
  const icA = document.querySelector('.icono-android');
  icA.style.width = (cfg.iconoAndroid.w * sx) + 'px';
  icA.style.height = (cfg.iconoAndroid.h * sx) + 'px';
  icA.style.border = 'none';
  icA.style.outline = 'none';
  icA.style.display = 'block';

  // Icono descarga
  const icD = document.querySelector('.icono-descarga');
  icD.style.width = (cfg.iconoDescarga.w * sx) + 'px';
  icD.style.height = (cfg.iconoDescarga.h * sx) + 'px';
  icD.style.border = 'none';
  icD.style.outline = 'none';
  icD.style.display = 'block';

  // ============================
  // PUBLICIDAD
  // ============================
  const pub = document.querySelector('.publicidad');
  const pubW = cfg.publicidad.w * sx;
  const pubH = pubW / PUB_RATIO;

  if (esMovil) {
    pub.style.left = (cfg.publicidad.x * sx) + 'px';
    pub.style.right = 'auto';
  } else {
    pub.style.right = (cfg.publicidad.right * sx) + 'px';
    pub.style.left = 'auto';
  }
  pub.style.top = (cfg.publicidad.y * sx) + 'px';
  pub.style.width = pubW + 'px';
  pub.style.height = pubH + 'px';
  pub.style.objectFit = 'cover';
  pub.style.objectPosition = 'top center';
  pub.style.display = 'block';

  // ============================
  // ALTO DEL CONTENIDO
  // ============================
  const contenido = document.querySelector('.contenido');

  const finBtn = (cfg.btnDescarga.y + cfg.btnDescarga.h) * sx;
  const finTexto = (cfg.subtitulo.y + 60) * sx;
  const finPub = (cfg.publicidad.y * sx) + pubH;

  const altoContenido = Math.max(finBtn, finTexto, finPub);

  contenido.style.height = altoContenido + 'px';

  // Menú móvil
  const menuMovil = document.getElementById('menuMovil');
  menuMovil.style.top = (cfg.cabecera.h * sx) + 'px';

  // Alto total de la pantalla
  const pantalla = document.querySelector('.pantalla');
  pantalla.style.height = altoContenido + 'px';
  pantalla.style.minHeight = '0';
}

// ============================
// ESPERAR A QUE CARGUE LA IMAGEN DE PUBLICIDAD
// ============================
const imgPub = new Image();
imgPub.src = '../Iconos/publicidad_rovant.png';
imgPub.onload = function () {
  PUB_RATIO = imgPub.naturalWidth / imgPub.naturalHeight;
  console.log('Proporción real publicidad:', PUB_RATIO);
  ajustar();
};

// ============================
// EVENTOS
// ============================
window.addEventListener('load', ajustar);
window.addEventListener('resize', ajustar);
ajustar();

// ============================
// MENÚ HAMBURGUESA (toggle)
// ============================
const menuHamb = document.querySelector('.menu-hamburguesa');
const menuMovil = document.getElementById('menuMovil');

menuHamb.addEventListener('click', (e) => {
  e.stopPropagation();
  menuMovil.classList.toggle('abierto');
});

document.addEventListener('click', (e) => {
  if (!menuMovil.contains(e.target) && e.target !== menuHamb) {
    menuMovil.classList.remove('abierto');
  }
});

document.querySelectorAll('.nav-link-movil').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link-movil').forEach(l => l.classList.remove('activo-movil'));
    link.classList.add('activo-movil');
    menuMovil.classList.remove('abierto');
  });
});

// ============================
// NAV PC - LINK ACTIVO
// ============================
document.querySelectorAll('.menu-pc .nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.menu-pc .nav-link').forEach(l => l.classList.remove('activo'));
    link.classList.add('activo');
    ajustar();
  });
});