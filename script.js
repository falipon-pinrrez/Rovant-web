// ============================
// COORDENADAS BASE (diseño PC 1512x982)
// ============================
const BASE = {
  W: 1512,
  H: 982,
  cabecera: { h: 140 },
  logoHeader: { x: 70, y: 42, w: 288, h: 62 },
  nav: {
    y: 63,
    fontSize: 20,
    items: [
      { text: 'Inicio', x: 519 },
      { text: 'Características', x: 625, y: 61 },
      { text: 'Beneficios', x: 827 },
      { text: 'Descargas', x: 966 },
      { text: 'Contacto', x: 1119 }
    ]
  },
  lineaActiva: { x: 514, y: 97, w: 55, h: 3 },
  menuHamburguesa: { x: 1386, y: 54, w: 32, h: 42 },
  logoPrincipal: { x: 146, y: 247, w: 400, h: 86 },
  textoPrincipal: { x: 146, y: 386, w: 520, fontSize: 24 },
  subtitulo: { x: 146, y: 560, fontSize: 16 },
  btnDescarga: { x: 143, y: 660, w: 347, h: 91, fontSize: 20 },
  iconoAndroid: { w: 42, h: 42 },
  iconoDescarga: { w: 32, h: 32 },
  publicidad: { right: 0, y: 180, w: 700 }
};

// ============================
// COORDENADAS MÓVIL (428x926)
// ============================
const MOVIL = {
  W: 428,
  H: 926,
  cabecera: { h: 82 },
  logoHeader: { x: 142, y: 26, w: 144, h: 31 },
  menuHamburguesa: { x: 380, y: 32, w: 20, h: 20 },
  logoPrincipal: { x: 85, y: 131, w: 258, h: 56 },
  textoPrincipal: { x: 52, y: 206, w: 324, fontSize: 16 },
  subtitulo: { x: 52, y: 330, fontSize: 14 },
  btnDescarga: { x: 108, y: 410, w: 212, h: 55, fontSize: 13 },
  iconoAndroid: { w: 26, h: 26 },
  iconoDescarga: { w: 19, h: 20 },
  publicidad: { x: -20, y: 520, w: 430 }
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
    menuPc.style.display = 'block';

    document.querySelectorAll('.menu-pc .nav-link').forEach((link, i) => {
      const item = BASE.nav.items[i];
      link.style.left = (item.x * sx) + 'px';
      link.style.top = ((item.y || BASE.nav.y) * sx) + 'px';
      link.style.fontSize = (BASE.nav.fontSize * sx) + 'px';
    });

    const linea = document.querySelector('.linea-activa');
    const activo = document.querySelector('.menu-pc .nav-link.activo');
    if (activo) {
      const rect = activo.getBoundingClientRect();
      const parent = activo.parentElement.getBoundingClientRect();
      linea.style.left = (rect.left - parent.left) + 'px';
      linea.style.top = (BASE.lineaActiva.y * sx) + 'px';
      linea.style.width = rect.width + 'px';
      linea.style.height = (BASE.lineaActiva.h * sx) + 'px';
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
  // BOTÓN DESCARGA (sin trazo negro, radio dinámico)
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

  // Radio perfecto (mitad del alto → pastilla completa)
  btn.style.borderRadius = (btnH / 2) + 'px';

  // Sin bordes ni contornos de ningún tipo
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
  // PUBLICIDAD - alto según proporción REAL de la imagen
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
  // Termina JUSTO en el borde inferior de la publicidad
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

  // Alto total de la pantalla = cabecera + contenido
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