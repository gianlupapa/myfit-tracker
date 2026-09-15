# MyFit Tracker V3 — UX/UI Redesign

## Importante
- NO requiere cambios de SQL.
- NO cambia tu proyecto Supabase.
- Usa las mismas tablas y conserva tus datos actuales.
- Sustituye los archivos de tu repositorio GitHub por los de esta carpeta.

## Novedades V3
- Look & feel oscuro/premium.
- Inicio con objetivo 84 kg / talla 42 y métricas.
- Entrenamiento con peso anterior precargado.
- Repeticiones/RPE de la sesión actual empiezan vacíos para registrar el día real.
- Sugerencia simple de progresión.
- Botón para copiar toda la última sesión.
- Completar serie con ✓.
- Temporizador automático de descanso.
- Historial por ejercicio dentro de cada ejercicio.
- Métricas de sesiones, mayor carga, mejor serie y volumen.
- Gráficas SVG de peso y cintura.
- Dieta visual con medidores.
- Recuperación con semáforo verde/amarillo/rojo.
- Service worker network-first para que las siguientes actualizaciones se vean antes.

## Cómo actualizar
1. Haz backup de tu repo actual si no lo has hecho.
2. En GitHub > myfit-tracker, sube/sustituye:
   - index.html
   - styles.css
   - app.js
   - config.js
   - manifest.json
   - service-worker.js
   - icons/
3. Commit: `V3 UX redesign`
4. Espera al deployment Success en Cloudflare.
5. Abre tu URL pública.
6. Si ves la versión anterior, cierra la PWA y vuelve a abrirla. Si todavía persiste, elimina la PWA instalada y vuelve a instalarla desde Chrome. Tus datos NO se borran porque están en Supabase.

## Flujo recomendado de prueba
1. Abre Entreno.
2. Selecciona un ejercicio que ya tenga histórico.
3. Comprueba que aparecen los kilos anteriores y el resumen de la última sesión.
4. Registra reps/RPE reales de hoy.
5. Pulsa ✓ al terminar una serie: inicia el descanso.
6. Abre Historial del ejercicio.
7. Guarda el entrenamiento.
8. Cierra/reabre y confirma que el nuevo entrenamiento aparece.
