# MyFit Tracker V3.2 — FIX crítico de registro de series

Esta versión corrige el problema por el que, durante un entrenamiento en móvil,
los kg/repeticiones/RPE podían desaparecer de repente.

## Causa corregida
Supabase renueva el token de autenticación periódicamente. La V3.1 reaccionaba
a cualquier cambio de autenticación reconstruyendo toda la pantalla de entreno.
Eso podía borrar del formulario las series que aún no se habían guardado al final.

## Protección añadida
1. TOKEN_REFRESHED ya NO reconstruye la pantalla de entrenamiento.
2. Kg/reps/RPE se guardan automáticamente como borrador local mientras escribes.
3. Al pulsar ✓ se guarda el borrador inmediatamente.
4. Se conserva también qué series estaban validadas.
5. Si Android recarga la PWA o vuelves desde segundo plano, el borrador se recupera.
6. Al pulsar Finalizar y guardar, se guarda en Supabase y se elimina el borrador local.
7. No requiere SQL ni cambios en Supabase.

## Actualización
Sustituye todos los archivos en GitHub y haz commit:
`V3.2 fix persistencia series`

Espera a Cloudflare Deployment -> Success y vuelve a abrir la PWA.

## Prueba recomendada
- Escribe kg + reps + RPE en una serie.
- Pulsa ✓.
- Espera al menos un minuto y cambia la app a segundo plano unos segundos.
- Vuelve: la serie debe seguir exactamente igual.
- Cierra y vuelve a abrir la PWA antes de Finalizar: el borrador debe recuperarse.
