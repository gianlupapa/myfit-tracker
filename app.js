import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = id => document.getElementById(id);

let currentUser = null;
let timerInterval = null;
let timerSeconds = 0;
let timerDefault = 90;
let latestMeasurements = [];
let draftSaveTimer = null;

function currentWorkoutDraftKey(){
  if(!currentUser) return null;
  const week = $("weekSelect")?.value || "4";
  const session = $("sessionSelect")?.value || "chest";
  return `myfit_workout_draft_v32_${currentUser.id}_${week}_${session}`;
}

function collectWorkoutDraft(){
  const key = currentWorkoutDraftKey();
  if(!key) return null;
  const sets = [...document.querySelectorAll("#exerciseList .set-row")].map(row => ({
    exercise: row.dataset.exercise,
    set: Number(row.dataset.set),
    kg: row.querySelector(".kg")?.value ?? "",
    reps: row.querySelector(".reps")?.value ?? "",
    rpe: row.querySelector(".rpe")?.value ?? "",
    done: row.classList.contains("done")
  }));
  return {
    version: 1,
    saved_at: new Date().toISOString(),
    week: Number($("weekSelect")?.value || 4),
    session: $("sessionSelect")?.value || "chest",
    notes: $("workoutNotes")?.value || "",
    sets
  };
}

function saveWorkoutDraft({showMessage=false} = {}){
  const key = currentWorkoutDraftKey();
  if(!key) return;
  try{
    const draft = collectWorkoutDraft();
    localStorage.setItem(key, JSON.stringify(draft));
    if(showMessage) status("workoutMsg","Borrador guardado automáticamente ✓","ok");
  }catch(_e){
    // El entrenamiento sigue funcionando aunque el almacenamiento local falle.
  }
}

function scheduleWorkoutDraftSave(){
  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(()=>saveWorkoutDraft(),180);
}

function clearCurrentWorkoutDraft(){
  const key = currentWorkoutDraftKey();
  if(!key) return;
  try{ localStorage.removeItem(key); }catch(_e){}
}

function restoreWorkoutDraft(){
  const key = currentWorkoutDraftKey();
  if(!key) return false;
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return false;
    const draft = JSON.parse(raw);
    if(!draft?.sets?.length) return false;

    $("workoutNotes").value = draft.notes || "";
    const rows = [...document.querySelectorAll("#exerciseList .set-row")];
    for(const row of rows){
      const saved = draft.sets.find(s =>
        s.exercise === row.dataset.exercise &&
        Number(s.set) === Number(row.dataset.set)
      );
      if(!saved) continue;
      row.querySelector(".kg").value = saved.kg ?? "";
      row.querySelector(".reps").value = saved.reps ?? "";
      row.querySelector(".rpe").value = saved.rpe ?? "";
      row.classList.toggle("done", !!saved.done);
      row.querySelector(".done-btn")?.classList.toggle("active", !!saved.done);
    }
    status("workoutMsg","Borrador recuperado automáticamente","ok");
    return true;
  }catch(_e){
    return false;
  }
}

const today = () => new Date().toISOString().slice(0,10);
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const valNum = id => $(id).value === "" ? null : Number($(id).value);
const fmtDate = v => {
  if(!v) return "—";
  const d = new Date(v);
  return new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"short"}).format(d);
};
function status(id,msg,type=""){
  const el=$(id); el.textContent=msg;
  el.style.color=type==="error"?"#ff6b75":type==="ok"?"#55dc88":"";
}


const sharedHomeA = {
  title:"Casa corto A",
  subtitle:"Rodilla/vastos + core + cardio bajo impacto",
  warmup:"Calentamiento: movilidad cadera/tobillo + marcha · 4 min · sin impacto.",
  weekNote:"",
  exercises:[
    ["Circuito x 3",3,"Wall sit parcial 30 s + glute bridge 15 + dead bug 8/lado + tibialis raise 15",60,"12-15 min · rodilla/vastos + core."],
    ["Cardio bajo impacto",1,"Caminata rápida o bici suave · 10-15 min",60,"RPE 5-6."],
    ["Final",1,"Respiración + estiramiento suave flexores/cadera · 3 min",30,"Descargar."]
  ]
};

const sharedHomeB = {
  title:"Casa corto B",
  subtitle:"Actividad corta + core + gasto sin fatigar pierna",
  warmup:"Calentamiento: movilidad torácica + hombros + cadera · 4 min · preparar articulaciones.",
  weekNote:"",
  exercises:[
    ["Circuito x 3",3,"Remo mancuerna 12/lado + press suelo 12 + elevaciones laterales 15 + plancha 35 s",60,"14-16 min · gasto corto sin machacar piernas."],
    ["Finisher",1,"Step touch o caminata rápida · 5-8 min",45,"Sin saltos."],
    ["Final",1,"Estiramientos suaves · 2 min",30,"Bajar pulsaciones."]
  ]
};

const weeklyPlans = {
  4:{
    note:"Semana de ajuste: vienes con buenos resultados, pero ahora priorizamos pecho, dorsales, hombro/trapecio, glúteo y rodilla. No subas todo a la vez.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 4 · ajuste",
      warmup:"Bicicleta suave + movilidad tobillo/cadera · 8-10 min. Calentar rodilla sin impacto; respiración nasal si es posible.",
      exercises:[
        ["Terminal Knee Extension en polea/banda",3,"15/lado",45,"Activación de vasto medial. Pausa 1 s en extensión."],
        ["Prensa de piernas rango seguro",4,"12",90,"Pies anchura cadera. No bloquear rodilla. Controlar bajada."],
        ["Hip thrust",4,"10-12",90,"Pausa 2 s arriba. Costillas abajo, pelvis estable."],
        ["Peso muerto rumano",3,"10",90,"3 s bajada. Sentir isquios/glúteo, no lumbar."],
        ["Step-up bajo",3,"10/lado",75,"Subir sin impulso. Rodilla alineada con segundo dedo."],
        ["Extensión de cuádriceps ligera",3,"15",60,"Control, sin fallo, sin bloqueo agresivo."],
        ["Abducción de cadera",3,"15-20",60,"Glúteo medio. No balancear tronco."],
        ["Core: plancha + Pallof + dead bug",3,"bloques",45,"Antirotación y control lumbopélvico."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 4 · masa + anchura + pecho bajo/central",
      warmup:"Mantén técnica limpia y 1-2 repeticiones en reserva en los presses.",
      exercises:[
        ["Press banca plano",4,"8-10",90,"Masa general de pecho."],
        ["Press inclinado con mancuernas",3,"8-10",90,"Pecho superior y forma."],
        ["Press declinado máquina/barra/mancuernas",3,"10-12",75,"Pecho bajo."],
        ["Aperturas en polea o peck deck",3,"12-15",60,"Anchura, estiramiento controlado."],
        ["Cruce de poleas arriba-abajo",3,"12-15",60,"Pecho bajo y zona central/esternal."],
        ["Elevaciones laterales",3,"15",60,"Deltoide lateral sin robar al pecho."],
        ["Tríceps cuerda",3,"10-12",60,"Final sin agotar hombro."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 4 · anchura dorsal + trapecio",
      warmup:"Hombros abajo antes de tirar; prioriza conexión dorsal y técnica.",
      exercises:[
        ["Jalón al pecho agarre neutro",4,"8-10",90,"Anchura dorsal. Hombros abajo antes de tirar."],
        ["Jalón unilateral en polea alta",4,"10-12/lado",75,"Codo hacia la cadera para dorsal bajo."],
        ["Pullover polea / brazos rectos",3,"12-15",60,"Conectar dorsal sin bíceps."],
        ["Remo pecho apoyado",3,"10-12",75,"Espalda media sin cargar lumbar."],
        ["Face pull",3,"15",60,"Trapecio medio + deltoide posterior."],
        ["Encogimientos o farmer carry",3,"12 / 30 m",75,"Trapecio superior."],
        ["Curl bíceps",3,"10-12",60,"Control."]
      ]
    }
  },
  5:{
    note:"Semana de progresión controlada: aumenta una variable por sesión (reps, carga pequeña o una serie en un accesorio), no todas.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 5 · progresión controlada",
      warmup:"Bicicleta suave + movilidad · 10 min. Si la rodilla molesta, alarga 3-4 min la bici.",
      exercises:[
        ["Wall sit parcial",3,"35-45 s",60,"Ángulo 45-60 grados. Sensación de vastos, no dolor."],
        ["Prensa de piernas",4,"10-12",90,"Aumenta carga solo si semana 4 fue limpia."],
        ["Hip thrust",4,"10",90,"Algo más pesado, misma técnica."],
        ["Peso muerto rumano",4,"8-10",90,"Prioridad cadena posterior."],
        ["Step-up bajo",3,"10-12/lado",75,"Sin empujarte con la pierna de atrás."],
        ["Extensión cuádriceps unilateral ligera",3,"12/lado",60,"Muy controlado. Rango sin dolor."],
        ["Gemelo + tibialis raise",3,"15-20",45,"Mejor soporte para rodilla y tobillo."],
        ["Core: Pallof + plancha lateral",3,"12/lado",45,"Estabilidad pelvis-rodilla."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 5 · progresión controlada",
      warmup:"Aumenta solo una variable si la semana 4 fue sólida.",
      exercises:[
        ["Press banca plano",4,"8-10",90,"Intenta +1 rep o +2,5 kg si fue fácil."],
        ["Press inclinado mancuernas",3,"8-10",90,"Control escapular."],
        ["Press declinado",3,"10-12",75,"Pecho bajo."],
        ["Aperturas polea/peck deck",3,"12-15",60,"Bajada lenta, pecho abierto."],
        ["Cruce poleas arriba-abajo",3,"12-15",60,"Aducción fuerte, sin balanceo."],
        ["Elevaciones laterales",3,"15",60,"Anchura hombro."],
        ["Tríceps cuerda",3,"10-12",60,"Sin fallo."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 5 · progresión controlada",
      warmup:"Misma estructura de semana 4; progresa solo si la técnica se mantiene.",
      exercises:[
        ["Jalón al pecho agarre neutro",4,"8-10",90,"Anchura dorsal. Hombros abajo antes de tirar."],
        ["Jalón unilateral en polea alta",4,"10-12/lado",75,"Codo hacia la cadera para dorsal bajo."],
        ["Pullover polea / brazos rectos",3,"12-15",60,"Conectar dorsal sin bíceps."],
        ["Remo pecho apoyado",3,"10-12",75,"Espalda media sin cargar lumbar."],
        ["Face pull",3,"15",60,"Trapecio medio + deltoide posterior."],
        ["Encogimientos o farmer carry",3,"12 / 30 m",75,"Trapecio superior."],
        ["Curl bíceps",3,"10-12",60,"Control."]
      ]
    }
  },
  6:{
    note:"Semana de progresión controlada: aumenta una variable por sesión (reps, carga pequeña o una serie en un accesorio), no todas.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 6 · glúteo + control excéntrico",
      warmup:"Bicicleta + movilidad + TKE · 12 min. Calentamiento obligatorio.",
      exercises:[
        ["Prensa pies medios",4,"10",90,"Rango un poco mayor solo si no duele."],
        ["Hip thrust",5,"8-10",90,"Prioridad glúteo firme."],
        ["Sentadilla goblet a banco",3,"10",75,"Bajada 3 s. Tocar banco, no descansar."],
        ["Peso muerto rumano",4,"8",90,"Control lumbar y cadera."],
        ["Step-down bajo",3,"8/lado",75,"Trabajo excéntrico de vastos. Sin valgo."],
        ["Abducción de cadera",4,"15",60,"Quemazón de glúteo medio, no balanceo."],
        ["Core: dead bug + plancha",3,"bloques",45,"No arquear lumbar."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 6 · fuerza + grosor",
      warmup:"Presses fuertes pero controlados. Sin fallo.",
      exercises:[
        ["Press banca plano",4,"6-8",105,"Fuerza y grosor."],
        ["Press inclinado mancuernas",3,"8-10",90,"Pecho superior."],
        ["Fondos asistidos torso inclinado",3,"8-10",90,"Pecho bajo. Si molesta, press declinado."],
        ["Press convergente en máquina",3,"10-12",75,"Sensación central por aducción."],
        ["Cruce de poleas medio",3,"12-15",60,"Cierre controlado."],
        ["Aperturas inclinadas ligeras",2,"15",60,"Estiramiento sin dolor."],
        ["Elevaciones laterales",3,"12-15",60,"Deltoide lateral."],
        ["Extensión tríceps sobre cabeza",2,"12",60,"Cabeza larga del tríceps."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 6 · dorsal ancho + densidad",
      warmup:"Tracciones fuertes con control; codo hacia el bolsillo en el unilateral.",
      exercises:[
        ["Dominada asistida o jalón neutro",4,"6-8",90,"Dorsal ancho."],
        ["Jalón unilateral",4,"10/lado",75,"Dorsal bajo, codo a bolsillo."],
        ["Pullover polea",4,"12",60,"Tensión continua."],
        ["Remo T o pecho apoyado",4,"8-10",90,"Densidad."],
        ["Reverse pec deck / pájaros",3,"15",60,"Deltoide posterior."],
        ["Encogimientos",4,"10-12",75,"Trapecio."],
        ["Curl martillo",3,"10-12",60,"Braquial y antebrazo."]
      ]
    }
  },
  7:{
    note:"Semana de progresión controlada: aumenta una variable por sesión (reps, carga pequeña o una serie en un accesorio), no todas.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 7 · fuerza controlada",
      warmup:"Bicicleta + movilidad · 10-12 min. La rodilla debe entrar caliente al trabajo.",
      exercises:[
        ["Wall sit parcial",3,"45 s",60,"Isométrico para vastos."],
        ["Prensa de piernas",5,"8-10",90,"Sube carga moderada. Técnica limpia."],
        ["Hip thrust",5,"8-10",90,"Pausa arriba."],
        ["Peso muerto rumano",4,"8",90,"Isquios/glúteo."],
        ["Step-down técnico",3,"8/lado",75,"Bajada lenta, rodilla estable."],
        ["Extensión de cuádriceps ligera",3,"15",60,"2-3 series. Solo bombeo, no fallo."],
        ["Core: Pallof + plancha lateral",3,"bloques",45,"Antirotación para golf/pádel."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 7 · consolidación",
      warmup:"Mantener técnica. Sin fallo.",
      exercises:[
        ["Press banca plano",4,"6-8",105,"Mantener técnica, no fallo."],
        ["Press inclinado mancuernas",3,"8-10",90,"Forma y grosor."],
        ["Fondos asistidos torso inclinado",3,"8-10",90,"Pecho bajo."],
        ["Press convergente",3,"10-12",75,"Aducción y densidad."],
        ["Cruce poleas medio",3,"12-15",60,"Parte central/esternal visual."],
        ["Aperturas inclinadas",2,"15",60,"Control."],
        ["Elevaciones laterales",3,"12-15",60,"Anchura."],
        ["Tríceps sobre cabeza",2,"12",60,"Sin sobrecargar codo."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 7 · dorsal ancho + densidad",
      warmup:"Técnica limpia; no balancees en tracciones ni encogimientos.",
      exercises:[
        ["Dominada asistida o jalón neutro",4,"6-8",90,"Dorsal ancho."],
        ["Jalón unilateral",4,"10/lado",75,"Dorsal bajo, codo a bolsillo."],
        ["Pullover polea",4,"12",60,"Tensión continua."],
        ["Remo T o pecho apoyado",4,"8-10",90,"Densidad."],
        ["Reverse pec deck / pájaros",3,"15",60,"Deltoide posterior."],
        ["Encogimientos",4,"10-12",75,"Trapecio."],
        ["Curl martillo",3,"10-12",60,"Braquial y antebrazo."]
      ]
    }
  },
  8:{
    note:"Semana de volumen estético: pecho y dorsal tienen más trabajo; controla descanso, sueño y dieta.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 8 · consolidación",
      warmup:"Bicicleta + movilidad + TKE · 12 min. Semana de consolidación.",
      exercises:[
        ["Prensa unilateral ligera",3,"10/lado",75,"Compara sensaciones izquierda/derecha."],
        ["Prensa bilateral",3,"10",90,"Carga media."],
        ["Hip thrust",4,"10",90,"Glúteo dominante."],
        ["RDL con mancuernas/barra",4,"8-10",90,"Tempo 3-1-1."],
        ["Step-up bajo",3,"10/lado",75,"Solidez, no velocidad."],
        ["Abducción + gemelo",3,"15-20",45,"Circuito controlado."],
        ["Core: dead bug + Pallof",3,"bloques",45,"Control pelvis."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 8 · volumen estético",
      warmup:"Más volumen de pecho. Controla descanso y técnica.",
      exercises:[
        ["Press inclinado mancuernas",4,"8-10",90,"Prioridad forma/pecho alto."],
        ["Press banca plano",4,"8",90,"Masa central."],
        ["Press declinado o fondos asistidos",3,"8-10",90,"Pecho bajo."],
        ["Aperturas en polea desde abajo",3,"12-15",60,"Estiramiento y control."],
        ["Cruce poleas arriba-abajo",3,"12-15",60,"Pecho bajo/central."],
        ["Squeeze press mancuernas",2,"12-15",60,"Sensación central."],
        ["Elevaciones laterales",4,"12-15",60,"Deltoide lateral."],
        ["Tríceps cuerda",3,"12",60,"2-3 series. Mantenimiento."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 8 · volumen estético",
      warmup:"Dorsal ancho + densidad. Mantén tensión continua.",
      exercises:[
        ["Dominada asistida o jalón neutro",4,"6-8",90,"Dorsal ancho."],
        ["Jalón unilateral",4,"10/lado",75,"Dorsal bajo, codo a bolsillo."],
        ["Pullover polea",4,"12",60,"Tensión continua."],
        ["Remo T o pecho apoyado",4,"8-10",90,"Densidad."],
        ["Reverse pec deck / pájaros",3,"15",60,"Deltoide posterior."],
        ["Encogimientos",4,"10-12",75,"Trapecio."],
        ["Curl martillo",3,"10-12",60,"Braquial y antebrazo."]
      ]
    }
  },
  9:{
    note:"Semana de volumen estético: pecho y dorsal tienen más trabajo; controla descanso, sueño y dieta.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 9 · volumen + fuerza glúteo",
      warmup:"Bicicleta + movilidad · 12 min. Si hay dolor de rodilla, reduce rango.",
      exercises:[
        ["Spanish squat o wall sit",3,"45 s",60,"Isométrico de vastos."],
        ["Prensa de piernas",5,"8",90,"Carga moderada-alta sin fallo."],
        ["Hip thrust",5,"8",90,"Prioridad fuerza glúteo."],
        ["Sentadilla goblet a banco",4,"8-10",75,"Rango seguro."],
        ["RDL",4,"8",90,"Sin tirones."],
        ["Step-down técnico",3,"8/lado",75,"Excéntrico lento."],
        ["Core: plancha + side plank",3,"bloques",45,"Estabilidad global."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 9 · volumen estético",
      warmup:"Progresión leve solo si la técnica es sólida.",
      exercises:[
        ["Press inclinado mancuernas",4,"8-10",90,"Intenta progresar leve."],
        ["Press banca plano",4,"8",90,"Control y densidad."],
        ["Press declinado/fondos",3,"8-10",90,"Pecho bajo."],
        ["Aperturas polea desde abajo",3,"12-15",60,"Rango amplio."],
        ["Cruce poleas arriba-abajo",3,"12-15",60,"Cierre fuerte."],
        ["Squeeze press",2,"12-15",60,"Bombeo central."],
        ["Elevaciones laterales",4,"12-15",60,"Anchura hombro."],
        ["Tríceps cuerda",3,"12",60,"2-3 series. Sin fallo."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 9 · volumen estético",
      warmup:"Mantén control de escápulas y codo hacia el bolsillo.",
      exercises:[
        ["Dominada asistida o jalón neutro",4,"6-8",90,"Dorsal ancho."],
        ["Jalón unilateral",4,"10/lado",75,"Dorsal bajo, codo a bolsillo."],
        ["Pullover polea",4,"12",60,"Tensión continua."],
        ["Remo T o pecho apoyado",4,"8-10",90,"Densidad."],
        ["Reverse pec deck / pájaros",3,"15",60,"Deltoide posterior."],
        ["Encogimientos",4,"10-12",75,"Trapecio."],
        ["Curl martillo",3,"10-12",60,"Braquial y antebrazo."]
      ]
    }
  },
  10:{
    note:"Semana de intensificación: cargas más serias en press y tracciones, pierna sin fallo y con rodilla controlada.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 10 · intensificación controlada",
      warmup:"Bicicleta + movilidad · 10-12 min. Mantener bajo impacto.",
      exercises:[
        ["TKE + wall sit",3,"15 + 35 s",60,"Activación vastos."],
        ["Prensa de piernas",4,"8-10",90,"No buscar récord."],
        ["Hip thrust",4,"8-10",90,"Firmeza glúteo."],
        ["Peso muerto rumano",4,"8",90,"Controlado."],
        ["Split squat asistido corto",3,"8/lado",75,"Paso corto, tronco estable."],
        ["Abducción de cadera",4,"15",60,"Glúteo medio."],
        ["Core: Pallof press",3,"12/lado",45,"Antirotación."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 10 · intensificación",
      warmup:"Cargas más serias en press, sin perder técnica.",
      exercises:[
        ["Press banca plano",5,"5-6",120,"Intensificación controlada."],
        ["Press inclinado mancuernas",3,"8-10",90,"Volumen."],
        ["Press declinado máquina",3,"8-10",90,"Pecho bajo."],
        ["Fondos asistidos o máquina convergente",3,"8-10",90,"Densidad."],
        ["Cruce de poleas",3,"12-15",60,"Bombeo central."],
        ["Aperturas máquina",2,"15",60,"Estiramiento."],
        ["Elevaciones laterales",3,"15",60,"Deltoide lateral."],
        ["Tríceps polea",2,"12",60,"Final."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 10 · calidad de tracción",
      warmup:"Tracciones controladas; no busques récords.",
      exercises:[
        ["Jalón neutro",4,"8",90,"Calidad de dorsales."],
        ["Jalón unilateral",3,"10-12/lado",75,"Control."],
        ["Pullover polea",3,"12-15",60,"Dorsal bajo."],
        ["Remo pecho apoyado",3,"10",75,"Mantener fuerza."],
        ["Face pull",3,"15",60,"Postura."],
        ["Farmer carry",3,"30-40 m",75,"Trapecio + core."],
        ["Curl bíceps",3,"10-12",60,"2-3 series. Sin exceso."]
      ]
    }
  },
  11:{
    note:"Semana de intensificación: cargas más serias en press y tracciones, pierna sin fallo y con rodilla controlada.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 11 · intensificación controlada",
      warmup:"Bicicleta + movilidad + activación · 12 min. Preparar rodilla y cadera.",
      exercises:[
        ["Prensa",5,"8",90,"Fuerte pero sin fallo."],
        ["Hip thrust",5,"8",90,"Pausa 2 s arriba."],
        ["RDL",4,"8",90,"Cadena posterior."],
        ["Step-up bajo con carga",3,"8/lado",75,"Solo si técnica perfecta."],
        ["Extensión cuádriceps ligera",3,"12-15",60,"Bombeo controlado."],
        ["Gemelo + tibial",3,"15-20",45,"Soporte de rodilla."],
        ["Core: plancha + dead bug",3,"bloques",45,"No fatigar lumbar."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 11 · intensificación",
      warmup:"Misma estructura de semana 10; ligera progresión si procede.",
      exercises:[
        ["Press banca plano",5,"5-6",120,"Misma estructura, ligera progresión si procede."],
        ["Press inclinado mancuernas",3,"8-10",90,"Sólido."],
        ["Press declinado máquina",3,"8-10",90,"Pecho bajo."],
        ["Fondos asistidos/máquina convergente",3,"8-10",90,"Densidad."],
        ["Cruce de poleas",3,"12-15",60,"Última serie: descendente suave opcional."],
        ["Aperturas máquina",2,"15",60,"No dolor hombro."],
        ["Elevaciones laterales",3,"15",60,"Anchura."],
        ["Tríceps polea",2,"12",60,"Sin fallo."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 11 · calidad de tracción",
      warmup:"Control técnico y buena postura.",
      exercises:[
        ["Jalón neutro",4,"8",90,"Calidad de dorsales."],
        ["Jalón unilateral",3,"10-12/lado",75,"Control."],
        ["Pullover polea",3,"12-15",60,"Dorsal bajo."],
        ["Remo pecho apoyado",3,"10",75,"Mantener fuerza."],
        ["Face pull",3,"15",60,"Postura."],
        ["Farmer carry",3,"30-40 m",75,"Trapecio + core."],
        ["Curl bíceps",3,"10-12",60,"2-3 series. Sin exceso."]
      ]
    }
  },
  12:{
    note:"Semana de descarga y evaluación: bajar volumen, medir cintura, fotos y sensaciones.",
    leg:{
      title:"Pierna + glúteo + rodilla/vastos + core",
      subtitle:"Semana 12 · descarga/evaluación",
      warmup:"Bicicleta + movilidad · 10 min. Semana de descarga/evaluación.",
      exercises:[
        ["Prensa ligera-media",3,"10",90,"Sin dolor, sensación fácil."],
        ["Hip thrust",3,"10",75,"Control."],
        ["RDL",3,"10",75,"Técnico."],
        ["Step-up bajo",2,"10/lado",60,"Simetría."],
        ["Wall sit parcial",2,"30 s",60,"Tolerancia rodilla."],
        ["Core suave",3,"bloques",45,"2-3 bloques. Descargar, medir, evaluar."]
      ]
    },
    chest:{
      title:"Pecho prioritario + deltoide lateral + tríceps",
      subtitle:"Semana 12 · descarga técnica",
      warmup:"Baja volumen, mantén control y no fuerces.",
      exercises:[
        ["Press banca plano",3,"8",90,"Descarga técnica."],
        ["Press inclinado mancuernas",3,"10",75,"Control."],
        ["Press declinado/fondos asistidos",2,"10",75,"Pecho bajo sin forzar."],
        ["Cruce de poleas",2,"15",60,"Bombeo."],
        ["Aperturas máquina",2,"15",60,"Estiramiento suave."],
        ["Elevaciones laterales",3,"15",60,"Mantener hombro."],
        ["Tríceps cuerda",2,"12",60,"Final suave."]
      ]
    },
    back:{
      title:"Espalda/dorsal + trapecio + deltoide posterior + bíceps",
      subtitle:"Semana 12 · descarga/evaluación",
      warmup:"Calidad técnica. No buscar marcas.",
      exercises:[
        ["Jalón neutro",4,"8",90,"Calidad de dorsales."],
        ["Jalón unilateral",3,"10-12/lado",75,"Control."],
        ["Pullover polea",3,"12-15",60,"Dorsal bajo."],
        ["Remo pecho apoyado",3,"10",75,"Mantener fuerza."],
        ["Face pull",3,"15",60,"Postura."],
        ["Farmer carry",3,"30-40 m",75,"Trapecio + core."],
        ["Curl bíceps",3,"10-12",60,"2-3 series. Sin exceso."]
      ]
    }
  }
};

function planFor(session,week){
  const w = weeklyPlans[week] || weeklyPlans[4];
  if(session==="homeA") {
    const p=structuredClone(sharedHomeA); p.weekNote=w.note; return p;
  }
  if(session==="homeB") {
    const p=structuredClone(sharedHomeB); p.weekNote=w.note; return p;
  }
  const p=structuredClone(w[session]);
  p.weekNote=w.note;
  return p;
}

// Agrupa variantes del mismo movimiento para que el historial no se fragmente
// al cambiar ligeramente el nombre entre semanas.
const exerciseAliasGroups = [
  ["Press inclinado con mancuernas","Press inclinado mancuernas"],
  ["Press declinado máquina/barra/mancuernas","Press declinado","Press declinado máquina","Press declinado/fondos","Press declinado/fondos asistidos","Press declinado o fondos asistidos"],
  ["Aperturas en polea o peck deck","Aperturas polea/peck deck"],
  ["Cruce de poleas arriba-abajo","Cruce poleas arriba-abajo"],
  ["Tríceps cuerda","Triceps cuerda"],
  ["Tríceps polea","Triceps polea"],
  ["Extensión tríceps sobre cabeza","Tríceps sobre cabeza","Extension triceps sobre cabeza"],
  ["Jalón al pecho agarre neutro","Jalon al pecho agarre neutro","Jalón neutro"],
  ["Jalón unilateral en polea alta","Jalon unilateral en polea alta","Jalón unilateral"],
  ["Pullover polea / brazos rectos","Pullover en polea / brazos rectos","Pullover polea"],
  ["Remo T o pecho apoyado","Remo pecho apoyado"],
  ["Encogimientos o farmer carry","Encogimientos","Farmer carry"],
  ["Peso muerto rumano","RDL","RDL con mancuernas/barra"],
  ["Prensa de piernas rango seguro","Prensa de piernas","Prensa pies medios","Prensa bilateral","Prensa","Prensa ligera-media"],
  ["Step-up bajo","Step-up bajo con carga"],
  ["Extensión de cuádriceps ligera","Extensión cuádriceps ligera","Extensión cuádriceps unilateral ligera"],
  ["Abducción de cadera","Abduccion de cadera"],
  ["Reverse pec deck / pájaros","Reverse pec deck / pajaros"],
  ["Curl bíceps","Curl biceps"]
];

function aliasesFor(name){
  for(const g of exerciseAliasGroups){
    if(g.includes(name)) return g;
  }
  return [name];
}


function navigate(page,title){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  $(page).classList.add("active");
  document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add("active");
  $("pageTitle").textContent=title;
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page,btn.dataset.title)));
$("goTrainBtn").addEventListener("click",()=>navigate("trainingPage","Entreno"));

for(let w=4;w<=12;w++){
  const o=document.createElement("option"); o.value=w; o.textContent=`Semana ${w}`; $("weekSelect").appendChild(o);
}
$("weekSelect").value="4";
$("measureDate").value=today();
$("nutritionDate").value=today();
$("recoveryDate").value=today();

async function showState(){
  $("authView").classList.toggle("hidden",!!currentUser);
  $("mainView").classList.toggle("hidden",!currentUser);
  if(currentUser) await refreshAll();
}

$("authForm").addEventListener("submit",async e=>{
  e.preventDefault(); status("authMsg","Entrando...");
  const {error}=await supabase.auth.signInWithPassword({email:$("emailInput").value.trim(),password:$("passwordInput").value});
  if(error) status("authMsg",error.message,"error"); else status("authMsg","Acceso correcto ✓","ok");
});
$("signupBtn").addEventListener("click",async()=>{
  const email=$("emailInput").value.trim(),password=$("passwordInput").value;
  if(!email||password.length<6) return status("authMsg","Introduce email y una contraseña de al menos 6 caracteres.","error");
  status("authMsg","Creando cuenta...");
  const {data,error}=await supabase.auth.signUp({email,password});
  if(error) return status("authMsg",error.message,"error");
  status("authMsg",data.session?"Cuenta creada ✓":"Cuenta creada. Revisa el email de confirmación.","ok");
});
$("logoutBtn").addEventListener("click",()=>supabase.auth.signOut());
supabase.auth.onAuthStateChange((event,s)=>{
  const nextUser = s?.user || null;
  const userChanged = currentUser?.id !== nextUser?.id;
  currentUser = nextUser;

  // IMPORTANTE: Supabase renueva el token periódicamente en segundo plano.
  // Antes cada TOKEN_REFRESHED reconstruía toda la pantalla de entrenamiento
  // y borraba las series que aún no se habían finalizado.
  if(event === "SIGNED_OUT"){
    showState();
    return;
  }
  if(event === "SIGNED_IN" && userChanged){
    showState();
  }
  // INITIAL_SESSION ya se resuelve con getSession() al arrancar.
  // TOKEN_REFRESHED y USER_UPDATED NO deben repintar el entrenamiento.
});

async function getExerciseHistory(name,limit=120){
  const {data,error}=await supabase.from("workout_sets")
    .select("workout_session_id,exercise_name,set_number,weight_kg,reps,rpe,completed_at")
    .eq("user_id",currentUser.id).in("exercise_name",aliasesFor(name))
    .order("completed_at",{ascending:false}).limit(limit);
  if(error||!data?.length) return [];
  const groups=new Map();
  for(const s of data){
    if(!groups.has(s.workout_session_id)) groups.set(s.workout_session_id,{id:s.workout_session_id,date:s.completed_at,sets:[]});
    groups.get(s.workout_session_id).sets.push(s);
  }
  return [...groups.values()].map(g=>({...g,sets:g.sets.sort((a,b)=>a.set_number-b.set_number)})).sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function sessionSummary(h){
  if(!h?.sets?.length) return "Sin histórico";
  return h.sets.map(s=>{
    const kg=s.weight_kg==null?"—":Number(s.weight_kg);
    const reps=s.reps==null?"—":s.reps;
    return `${kg}×${reps}`;
  }).join(" · ");
}
function repRangeTop(target){
  const nums=String(target).match(/\d+/g)?.map(Number)||[];
  return nums.length?Math.max(...nums.slice(0,2)):null;
}
function suggestNext(latest,target){
  if(!latest?.sets?.length) return "Primera sesión";
  const weighted=latest.sets.filter(s=>Number(s.weight_kg)>0 && Number(s.reps)>0);
  if(!weighted.length) return "Repite y registra";
  const weights=weighted.map(s=>Number(s.weight_kg));
  const same=weights.every(w=>w===weights[0]);
  const top=repRangeTop(target);
  const allHit=top?weighted.every(s=>Number(s.reps)>=top):false;
  const rpes=weighted.map(s=>Number(s.rpe)).filter(n=>n>0);
  const avgRpe=rpes.length?rpes.reduce((a,b)=>a+b,0)/rpes.length:null;
  if(same&&allHit&&(avgRpe===null||avgRpe<=8)) return `Prueba ${weights[0]+2.5} kg`;
  return `Mantén ${weights[0]} kg`;
}

function populateSetRow(row,prev){
  if(prev){
    row.querySelector(".kg").value=prev.weight_kg??"";
    row.querySelector(".reps").value=prev.reps??"";
    row.querySelector(".rpe").value=prev.rpe??"";
  }
}
function startTimer(seconds){
  clearInterval(timerInterval);
  timerDefault=seconds||90; timerSeconds=timerDefault;
  $("timerBar").classList.remove("hidden");
  renderTimer();
  timerInterval=setInterval(()=>{
    timerSeconds--;
    if(timerSeconds<=0){clearInterval(timerInterval);timerInterval=null;timerSeconds=0;}
    renderTimer();
  },1000);
}
function renderTimer(){
  const m=Math.floor(timerSeconds/60),s=timerSeconds%60;
  $("timerValue").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  if(timerSeconds<=0) $("timerBar").classList.add("hidden");
}
$("timerSkipBtn").addEventListener("click",()=>{clearInterval(timerInterval);timerSeconds=0;renderTimer();});
$("timerPlusBtn").addEventListener("click",()=>{timerSeconds+=15;renderTimer();});
$("timerMinusBtn").addEventListener("click",()=>{timerSeconds=Math.max(0,timerSeconds-15);renderTimer();});

async function renderExerciseHistoryDrawer(drawer,name){
  drawer.innerHTML=`<div class="muted">Cargando historial...</div>`;
  const history=await getExerciseHistory(name,150);
  if(!history.length){drawer.innerHTML=`<div class="muted">Aún no hay sesiones guardadas para este ejercicio.</div>`;return;}
  const all=history.flatMap(h=>h.sets).filter(s=>s.weight_kg!=null||s.reps!=null);
  const maxW=Math.max(...all.map(s=>Number(s.weight_kg||0)));
  const best=all.reduce((b,s)=>Number(s.weight_kg||0)*Number(s.reps||0)>(b.score||-1)?{score:Number(s.weight_kg||0)*Number(s.reps||0),s}:b,{}).s;
  const latestVol=history[0].sets.reduce((sum,s)=>sum+Number(s.weight_kg||0)*Number(s.reps||0),0);
  drawer.innerHTML=`
    <div class="history-stats">
      <div class="history-stat"><span>Sesiones</span><strong>${history.length}</strong></div>
      <div class="history-stat"><span>Mayor carga</span><strong>${maxW} kg</strong></div>
      <div class="history-stat"><span>Mejor serie</span><strong>${best?`${best.weight_kg}×${best.reps}`:"—"}</strong></div>
    </div>
    <div class="history-stat" style="margin-bottom:10px"><span>Volumen última sesión</span><strong>${Math.round(latestVol).toLocaleString("es-ES")} kg</strong></div>
    <div class="history-list"></div>`;
  const list=drawer.querySelector(".history-list");
  history.slice(0,10).forEach((h,i)=>{
    const vol=h.sets.reduce((sum,s)=>sum+Number(s.weight_kg||0)*Number(s.reps||0),0);
    const el=document.createElement("div"); el.className="history-item";
    el.innerHTML=`<strong>${fmtDate(h.date)}${i===0?" · última":""}</strong><span>${sessionSummary(h)}</span><span>Volumen ${Math.round(vol).toLocaleString("es-ES")} kg</span>`;
    list.appendChild(el);
  });
}

async function renderWorkout(){
  if(!currentUser) return;
  const week=Number($("weekSelect").value),session=$("sessionSelect").value,plan=planFor(session,week);
  $("sessionTitle").textContent=plan.title;
  $("sessionSubtitle").textContent=`Semana ${week} · ${plan.subtitle}`;
  $("todayWorkout").textContent=plan.title;
  $("todayWorkoutHint").textContent=`Semana ${week} · ${plan.subtitle}`;
  $("warmupText").textContent=`${plan.weekNote ? plan.weekNote + " " : ""}${plan.warmup}`;
  const totalSets=plan.exercises.reduce((sum,e)=>sum+Number(e[1]||0),0);
  $("sessionVolumeBadge").textContent=`${totalSets} series`;

  const list=$("exerciseList"); list.innerHTML="";
  for(const [name,sets,reps,rest,note] of plan.exercises){
    const history=await getExerciseHistory(name,80);
    const latest=history[0]||null;
    const suggestion=suggestNext(latest,reps);
    const card=document.createElement("article"); card.className="exercise-card";
    card.innerHTML=`
      <div class="exercise-top">
        <div class="exercise-heading">
          <div>
            <div class="exercise-name">${name}</div>
            ${note ? `<div class="exercise-note">${note}</div>` : ""}
          </div>
          <div class="exercise-target">${sets} series · ${reps}<br>${rest}s descanso</div>
        </div>
        <div class="last-block">
          <div><span class="last-label">ÚLTIMA SESIÓN</span><div class="last-summary">${sessionSummary(latest)}</div></div>
          <div class="suggestion">${suggestion}</div>
        </div>
      </div>
      <div class="exercise-body">
        <div class="set-head"><span></span><span>KG</span><span>REPS</span><span>RPE</span><span></span></div>
        <div class="set-box"></div>
      </div>
      <div class="exercise-actions">
        <button class="btn secondary copy-last" type="button">Copiar última</button>
        <button class="btn secondary show-history" type="button">Historial</button>
      </div>
      <div class="history-drawer"></div>`;

    const box=card.querySelector(".set-box");
    for(let s=1;s<=Number(sets);s++){
      const prev=latest?.sets.find(x=>Number(x.set_number)===s);
      const row=document.createElement("div"); row.className="set-row"; row.dataset.exercise=name; row.dataset.set=s; row.dataset.rest=rest;
      row.innerHTML=`
        <span class="set-index">S${s}</span>
        <input class="kg" type="number" min="0" max="500" step="0.5" inputmode="decimal" placeholder="kg">
        <input class="reps" type="number" min="0" max="200" step="1" inputmode="numeric" placeholder="reps">
        <input class="rpe" type="number" min="1" max="10" step="0.5" inputmode="decimal" placeholder="RPE">
        <button class="done-btn" type="button" aria-label="Completar serie">✓</button>`;
      if(prev){
        row.querySelector(".kg").value=prev.weight_kg??"";
        row.querySelector(".reps").value="";
        row.querySelector(".rpe").value="";
      }
      row.querySelector(".done-btn").addEventListener("click",()=>{
        row.classList.toggle("done");
        row.querySelector(".done-btn").classList.toggle("active");
        saveWorkoutDraft({showMessage:true});
        if(row.classList.contains("done")) startTimer(Number(row.dataset.rest)||90);
      });

      // Cada cambio de kg/reps/RPE se guarda como borrador local.
      // Si Android recarga la PWA, vuelve del segundo plano o se refresca la sesión,
      // los datos se recuperan al reconstruir el entrenamiento.
      row.querySelectorAll("input").forEach(input=>{
        input.addEventListener("input",scheduleWorkoutDraftSave);
        input.addEventListener("change",()=>saveWorkoutDraft());
      });
      box.appendChild(row);
    }

    card.querySelector(".copy-last").addEventListener("click",()=>{
      if(!latest) return;
      card.querySelectorAll(".set-row").forEach(row=>{
        const prev=latest.sets.find(x=>Number(x.set_number)===Number(row.dataset.set));
        populateSetRow(row,prev);
      });
      saveWorkoutDraft({showMessage:true});
    });
    card.querySelector(".show-history").addEventListener("click",async()=>{
      const drawer=card.querySelector(".history-drawer");
      drawer.classList.toggle("open");
      if(drawer.classList.contains("open")&&!drawer.dataset.loaded){
        drawer.dataset.loaded="1";
        await renderExerciseHistoryDrawer(drawer,name);
      }
    });
    list.appendChild(card);
  }

  // Si había una sesión sin finalizar, recupera exactamente kg/reps/RPE
  // y qué series estaban validadas.
  restoreWorkoutDraft();
}
$("weekSelect").addEventListener("change",renderWorkout);
$("sessionSelect").addEventListener("change",renderWorkout);
$("workoutNotes").addEventListener("input",scheduleWorkoutDraftSave);

// Antes de que Android cierre/recargue la vista, intenta conservar el borrador.
window.addEventListener("pagehide",()=>saveWorkoutDraft());
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState === "hidden") saveWorkoutDraft();
});

$("saveWorkoutBtn").addEventListener("click",async()=>{
  status("workoutMsg","Guardando...");
  const week=Number($("weekSelect").value),plan=planFor($("sessionSelect").value,week);
  const {data:ws,error:wErr}=await supabase.from("workout_sessions").insert({
    user_id:currentUser.id,week_number:week,title:plan.title,
    started_at:new Date().toISOString(),completed_at:new Date().toISOString(),
    notes:$("workoutNotes").value.trim()||null
  }).select("id").single();
  if(wErr) return status("workoutMsg",wErr.message,"error");
  const payload=[...document.querySelectorAll("#exerciseList .set-row")].map(row=>{
    const kg=row.querySelector(".kg").value,reps=row.querySelector(".reps").value,rpe=row.querySelector(".rpe").value;
    return {
      user_id:currentUser.id,workout_session_id:ws.id,exercise_name:row.dataset.exercise,set_number:Number(row.dataset.set),
      weight_kg:kg===""?null:Number(kg),reps:reps===""?null:Number(reps),rpe:rpe===""?null:Number(rpe)
    };
  }).filter(x=>x.weight_kg!==null||x.reps!==null||x.rpe!==null);
  if(payload.length){
    const {error}=await supabase.from("workout_sets").insert(payload);
    if(error) return status("workoutMsg",error.message,"error");
  }
  clearCurrentWorkoutDraft();
  $("workoutNotes").value="";
  clearInterval(timerInterval); timerSeconds=0; renderTimer();
  await Promise.all([renderWorkout(),renderRecentWorkouts()]);
  status("workoutMsg","Entrenamiento guardado en la nube ✓","ok");
});

async function renderRecentWorkouts(){
  const {data}=await supabase.from("workout_sessions")
    .select("title,week_number,completed_at")
    .eq("user_id",currentUser.id).order("completed_at",{ascending:false}).limit(5);
  const targets=[$("homeRecentWorkouts")];
  for(const el of targets){
    if(!data?.length){el.innerHTML=`<p class="muted">Todavía no hay entrenamientos.</p>`;continue;}
    el.innerHTML="";
    data.forEach(x=>{
      const row=document.createElement("div"); row.className="timeline-item";
      row.innerHTML=`<div class="timeline-dot"></div><div><strong>${x.title}</strong><span>Semana ${x.week_number??"—"} · ${fmtDate(x.completed_at)}</span></div>`;
      el.appendChild(row);
    });
  }
}

function deltaText(arr,key,unit){
  const valid=arr.filter(x=>x[key]!=null);
  if(valid.length<2) return {text:"Sin comparación",cls:"neutral"};
  const d=Number(valid[0][key])-Number(valid[1][key]);
  if(Math.abs(d)<0.01) return {text:"Sin cambio",cls:"neutral"};
  return {text:`${d>0?"+":""}${d.toFixed(1)} ${unit} vs anterior`,cls:d<0?"good":"warn"};
}
function setTrend(id,obj){
  const el=$(id); el.textContent=obj.text; el.className=`trend ${obj.cls}`;
}
function drawLineChart(svgId,rows,key,unit){
  const svg=$(svgId), data=[...rows].filter(x=>x[key]!=null).reverse();
  svg.innerHTML="";
  if(data.length<2){
    svg.innerHTML=`<text x="350" y="112" text-anchor="middle" class="chart-label">Añade al menos 2 mediciones</text>`;
    return;
  }
  const W=700,H=220,padX=28,padY=24;
  const vals=data.map(x=>Number(x[key]));
  let min=Math.min(...vals),max=Math.max(...vals);
  if(min===max){min-=1;max+=1}
  const extra=(max-min)*.18; min-=extra; max+=extra;
  const x=i=>padX+(W-padX*2)*(i/(data.length-1));
  const y=v=>H-padY-(H-padY*2)*((v-min)/(max-min));
  for(let i=0;i<4;i++){
    const gy=padY+(H-padY*2)*(i/3);
    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",padX);line.setAttribute("x2",W-padX);line.setAttribute("y1",gy);line.setAttribute("y2",gy);line.setAttribute("class","chart-grid-line");svg.appendChild(line);
  }
  const defs=document.createElementNS("http://www.w3.org/2000/svg","defs");
  defs.innerHTML=`<linearGradient id="${svgId}Gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#58d7ff" stop-opacity=".24"/><stop offset="100%" stop-color="#58d7ff" stop-opacity="0"/></linearGradient>`;
  svg.appendChild(defs);
  const points=data.map((d,i)=>`${x(i)},${y(Number(d[key]))}`).join(" ");
  const area=document.createElementNS("http://www.w3.org/2000/svg","polygon");
  area.setAttribute("points",`${x(0)},${H-padY} ${points} ${x(data.length-1)},${H-padY}`);
  area.setAttribute("fill",`url(#${svgId}Gradient)`); svg.appendChild(area);
  const poly=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  poly.setAttribute("points",points);poly.setAttribute("class","chart-line");svg.appendChild(poly);
  data.forEach((d,i)=>{
    const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",x(i));c.setAttribute("cy",y(Number(d[key])));c.setAttribute("r",i===data.length-1?6:4);c.setAttribute("class","chart-dot");
    const title=document.createElementNS("http://www.w3.org/2000/svg","title");
    title.textContent=`${fmtDate(d.measured_at)}: ${d[key]} ${unit}`; c.appendChild(title); svg.appendChild(c);
  });
}

async function renderMeasurements(){
  const {data}=await supabase.from("body_measurements")
    .select("measured_at,weight_kg,body_fat_pct,waist_cm,hip_cm,thigh_cm")
    .eq("user_id",currentUser.id).order("measured_at",{ascending:false}).limit(30);
  latestMeasurements=data||[];
  const el=$("measurementHistory");
  if(!data?.length){
    ["homeWeight","homeWaist","homeFat","metricWeight","metricWaist","metricFat"].forEach(id=>$(id).textContent="—");
    $("goalRing").style.strokeDashoffset="301.59";
    el.textContent="Todavía no hay mediciones.";
    drawLineChart("weightChart",[],"weight_kg","kg");drawLineChart("waistChart",[],"waist_cm","cm");
    return;
  }
  const x=data[0];
  $("homeWeight").textContent=x.weight_kg!=null?`${x.weight_kg} kg`:"—";
  $("homeWaist").textContent=x.waist_cm!=null?`${x.waist_cm} cm`:"—";
  $("homeFat").textContent=x.body_fat_pct!=null?`${x.body_fat_pct}%`:"—";
  $("metricWeight").textContent=x.weight_kg!=null?`${x.weight_kg} kg`:"—";
  $("metricWaist").textContent=x.waist_cm!=null?`${x.waist_cm} cm`:"—";
  $("metricFat").textContent=x.body_fat_pct!=null?`${x.body_fat_pct}%`:"—";
  setTrend("waistTrend",deltaText(data,"waist_cm","cm"));
  setTrend("fatTrend",deltaText(data,"body_fat_pct","%"));
  setTrend("metricWeightDelta",deltaText(data,"weight_kg","kg"));
  setTrend("metricWaistDelta",deltaText(data,"waist_cm","cm"));
  setTrend("metricFatDelta",deltaText(data,"body_fat_pct","%"));

  const initial=[...data].reverse().find(m=>m.weight_kg!=null)?.weight_kg;
  const current=x.weight_kg;
  if(initial&&current){
    const total=Math.max(.1,initial-84),done=clamp((initial-current)/total,0,1);
    $("goalRing").style.strokeDashoffset=String(301.59*(1-done));
  }

  drawLineChart("weightChart",data.slice(0,12),"weight_kg","kg");
  drawLineChart("waistChart",data.slice(0,12),"waist_cm","cm");

  el.innerHTML="";
  data.slice(0,12).forEach(m=>{
    const row=document.createElement("div");row.className="data-row";
    row.innerHTML=`<div><strong>${fmtDate(m.measured_at)}</strong><span>Cadera ${m.hip_cm??"—"} · Muslo ${m.thigh_cm??"—"}</span></div><div class="right"><strong>${m.weight_kg??"—"} kg</strong><span>Cintura ${m.waist_cm??"—"} · Grasa ${m.body_fat_pct??"—"}%</span></div>`;
    el.appendChild(row);
  });
}
$("toggleMeasureFormBtn").addEventListener("click",()=>$("measurementFormCard").classList.toggle("hidden"));
$("measurementForm").addEventListener("submit",async e=>{
  e.preventDefault(); status("measurementMsg","Guardando...");
  const payload={
    user_id:currentUser.id,
    measured_at:new Date(`${$("measureDate").value}T08:00:00`).toISOString(),
    weight_kg:Number($("weightInput").value),
    body_fat_pct:valNum("fatInput"),
    visceral_fat:valNum("visceralInput"),
    muscle_mass_kg:valNum("muscleInput"),
    body_water_pct:valNum("waterPctInput"),
    waist_cm:valNum("waistInput"),hip_cm:valNum("hipInput"),thigh_cm:valNum("thighInput"),
    source:"manual"
  };
  const {error}=await supabase.from("body_measurements").insert(payload);
  if(error) return status("measurementMsg",error.message,"error");
  status("measurementMsg","Medición guardada ✓","ok");
  await renderMeasurements();
});

function updateNutritionMeters(){
  const protein=Number($("proteinInput").value||0),cal=Number($("caloriesInput").value||0),water=Number($("waterInput").value||0);
  $("proteinRingValue").textContent=Math.round(protein);$("proteinCircle").style.setProperty("--p",clamp(protein/175*100,0,100));
  $("calorieRingValue").textContent=Math.round(cal);$("calorieCircle").style.setProperty("--p",clamp(cal/1850*100,0,100));
  $("waterRingValue").textContent=water?water.toFixed(1):"0";$("waterCircle").style.setProperty("--p",clamp(water/3*100,0,100));
  $("homeProtein").textContent=`${Math.round(protein)} / 175 g`;
  $("homeProteinBar").style.width=`${clamp(protein/175*100,0,100)}%`;
}
["proteinInput","caloriesInput","waterInput"].forEach(id=>$(id).addEventListener("input",updateNutritionMeters));

async function loadNutrition(){
  const d=$("nutritionDate").value;
  const {data}=await supabase.from("nutrition_logs").select("*").eq("user_id",currentUser.id).eq("log_date",d).maybeSingle();
  const x=data||{};
  $("caloriesInput").value=x.calories??"";
  $("proteinInput").value=x.protein_g??"";
  $("carbsInput").value=x.carbs_g??"";
  $("fatMacroInput").value=x.fat_g??"";
  $("waterInput").value=x.water_l??"";
  $("fastingInput").value=x.fasting_hours??"";
  $("creatineCheck").checked=!!x.creatine;$("d3Check").checked=!!x.d3_k2;$("magnesiumCheck").checked=!!x.magnesium;
  $("nutritionNotes").value=x.notes??"";
  updateNutritionMeters();
}
$("nutritionDate").addEventListener("change",loadNutrition);
$("saveNutritionBtn").addEventListener("click",async()=>{
  status("nutritionMsg","Guardando...");
  const payload={
    user_id:currentUser.id,log_date:$("nutritionDate").value,calories:valNum("caloriesInput"),
    protein_g:valNum("proteinInput"),carbs_g:valNum("carbsInput"),fat_g:valNum("fatMacroInput"),
    water_l:valNum("waterInput"),fasting_hours:valNum("fastingInput"),
    creatine:$("creatineCheck").checked,d3_k2:$("d3Check").checked,magnesium:$("magnesiumCheck").checked,
    notes:$("nutritionNotes").value.trim()||null
  };
  const {error}=await supabase.from("nutrition_logs").upsert(payload,{onConflict:"user_id,log_date"});
  if(error) return status("nutritionMsg",error.message,"error");
  status("nutritionMsg","Día guardado ✓","ok");updateNutritionMeters();
});

function recoveryState(vals){
  const max=Math.max(...vals);
  if(max<=2) return {cls:"green",title:"Listo para entrenar",text:"Molestias bajas. Mantén buena técnica y el calentamiento previsto."};
  if(max<=4) return {cls:"yellow",title:"Entrena con control",text:"Reduce carga o rango si hace falta. Hoy no progreses agresivamente."};
  return {cls:"red",title:"No fuerces",text:"Prioriza recuperación. Si persiste, empeora o hay pérdida de fuerza/inflamación, consulta con fisio/traumatólogo."};
}
function renderRecoveryState(vals){
  const s=recoveryState(vals),card=$("readinessCard");
  card.className=`readiness-card card readiness-${s.cls}`;
  $("readinessTitle").textContent=s.title;$("readinessText").textContent=s.text;
  $("homeRecovery").textContent=s.title==="Listo para entrenar"?"Verde":s.title==="Entrena con control"?"Amarillo":"Rojo";
  $("homeRecoveryHint").textContent=s.text.split(".")[0];
  $("homeRecoveryHint").className=`trend ${s.cls==="green"?"good":s.cls==="yellow"?"warn":"bad"}`;
}
["rightKneeInput","leftKneeInput","rightRFInput","leftRFInput"].forEach(id=>$(id).addEventListener("input",()=>{
  renderRecoveryState(["rightKneeInput","leftKneeInput","rightRFInput","leftRFInput"].map(x=>Number($(x).value||0)));
}));

async function loadRecovery(){
  const d=$("recoveryDate").value;
  const {data}=await supabase.from("recovery_logs").select("*").eq("user_id",currentUser.id).eq("log_date",d).maybeSingle();
  const x=data||{};
  $("rightKneeInput").value=x.right_knee??0;$("leftKneeInput").value=x.left_knee??0;
  $("rightRFInput").value=x.right_rectus_femoris??0;$("leftRFInput").value=x.left_rectus_femoris??0;
  $("rightTightnessInput").value=x.right_rectus_tightness??"ninguna";
  $("energyInput").value=x.energy??"";$("sleepInput").value=x.sleep_hours??"";$("recoveryNotes").value=x.notes??"";
  renderRecoveryState([x.right_knee??0,x.left_knee??0,x.right_rectus_femoris??0,x.left_rectus_femoris??0]);
}
$("recoveryDate").addEventListener("change",loadRecovery);
$("saveRecoveryBtn").addEventListener("click",async()=>{
  status("recoveryMsg","Guardando...");
  const payload={
    user_id:currentUser.id,log_date:$("recoveryDate").value,
    right_knee:Number($("rightKneeInput").value||0),left_knee:Number($("leftKneeInput").value||0),
    right_rectus_femoris:Number($("rightRFInput").value||0),left_rectus_femoris:Number($("leftRFInput").value||0),
    right_rectus_tightness:$("rightTightnessInput").value,energy:valNum("energyInput"),sleep_hours:valNum("sleepInput"),
    notes:$("recoveryNotes").value.trim()||null
  };
  const {error}=await supabase.from("recovery_logs").upsert(payload,{onConflict:"user_id,log_date"});
  if(error) return status("recoveryMsg",error.message,"error");
  status("recoveryMsg","Recuperación guardada ✓","ok");await loadRecovery();
});

async function refreshAll(){
  await Promise.all([renderMeasurements(),renderRecentWorkouts(),loadNutrition(),loadRecovery()]);
  await renderWorkout();
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js",{updateViaCache:"none"}).catch(()=>{}));
}
const {data}=await supabase.auth.getSession();
currentUser=data.session?.user||null;
await showState();
