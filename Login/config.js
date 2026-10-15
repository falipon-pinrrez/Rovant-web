// ===== CONFIGURACIÓN SUPABASE - ROVANT =====
const SUPABASE_URL = 'https://dvqvzefcxazlgkhsosed.supabase.co';

// 🔑 REEMPLAZA ESTO con tu Publishable key completa
const SUPABASE_ANON_KEY = 'sb_publishable_Q9VtQm75X_BvBS5e3Slm_g_Jjtt3PWh';

// Cliente global de Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);