# MyFit Tracker — Android/PWA

## Qué contiene
- Login con Supabase Auth.
- Plan semanas 4–12.
- 3 días de gimnasio + 2 sesiones cortas en casa.
- Registro persistente de pesos, repeticiones y RPE.
- Histórico de entrenamientos.
- Registro de peso, grasa, cintura, cadera y muslo.
- Dieta, proteína, calorías, agua, ayuno y suplementos.
- Seguimiento de rodillas y rectos femorales.
- Instalación como PWA en Android.

## Antes de publicar
1. En Supabase confirma que Email está activado en Authentication.
2. Sube TODOS los archivos de esta carpeta a la raíz de tu repositorio GitHub `myfit-tracker`.
3. Publica el repo con Cloudflare Pages.
4. Abre la URL de Cloudflare en Chrome Android.
5. Menú ⋮ > Instalar aplicación.

## Registro
La primera vez pulsa "Crear cuenta". Si Supabase tiene confirmación de email activada, confirma el correo antes de entrar.

## Seguridad
`config.js` contiene una Publishable Key de Supabase, diseñada para cliente. No pongas nunca una Secret Key ni `service_role` en el repositorio.
