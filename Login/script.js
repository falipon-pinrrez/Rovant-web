// ===== LOGIN - ROVANT =====

document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btnLogin');
    const inputUsuario = document.getElementById('usuario');
    const inputPassword = document.getElementById('password');

    // Función que maneja el inicio de sesión
    function iniciarSesion() {
        const usuario = inputUsuario.value.trim();
        const password = inputPassword.value.trim();

        // Validación básica
        if (!usuario) {
            alert('Por favor, ingresa tu usuario.');
            inputUsuario.focus();
            return;
        }

        if (!password) {
            alert('Por favor, ingresa tu contraseña.');
            inputPassword.focus();
            return;
        }

        // Aquí puedes conectar con tu backend o lógica de autenticación
        console.log('Intentando iniciar sesión con:');
        console.log('Usuario:', usuario);
        console.log('Contraseña:', password);

        // Ejemplo de redirección (descomenta y ajusta cuando tengas tu lógica):
        // window.location.href = 'dashboard.html';
    }

    // Click en el botón
    btnLogin.addEventListener('click', iniciarSesion);

    // Enter en los inputs
    inputUsuario.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') iniciarSesion();
    });

    inputPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') iniciarSesion();
    });
});