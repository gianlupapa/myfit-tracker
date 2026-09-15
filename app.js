import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = id => document.getElementById(id);
let currentUser = null;

const basePlans = {
  leg:{title:"Pierna + glúteo + rodilla + core",warmup:"Bici suave 6 min · heel slides 2×12 · flexión de rodilla tumbado 2×10 · puente glúteo 2×15 · TKE 2×15 · wall sit parcial 2×25–30 s.",exercises:[["Prensa de piernas",4,"10–12","90 s"],["Hip thrust",4,"10–12","90 s"],["Peso muerto rumano",3,"8–10","90 s"],["Step-up bajo",3,"10/lado","75 s"],["Extensión de cuádriceps ligera",3,"12–15","60 s"],["Abducción de cadera",3,"15–20","60 s"],["Gemelos",3,"15–20","45–60 s"],["Pallof press",3,"12/lado","45–60 s"]]},
  back:{title:"Espalda + dorsal + trapecio + bíceps",warmup:"5–7 min suaves + movilidad torácica + 2 series ligeras de jalón/remo.",exercises:[["Jalón al pecho agarre neutro",4,"8–10","90 s"],["Jalón unilateral en polea alta",4,"10–12/lado","75 s"],["Pullover en polea / brazos rectos",3,"12–15","60 s"],["Remo pecho apoyado",3,"10–12","75 s"],["Face pull",3,"15","60 s"],["Encogimientos / farmer carry",3,"10–12 / 30 m","75 s"],["Curl bíceps",3,"10–12","60 s"]]},
  homeA:{title:"Casa A · 20–25 min",warmup:"Sesión corta. Sin saltos ni HIIT agresivo. RPE 6–7.",exercises:[["Marcha rápida / bici / spinning suave",1,"10 min","—"],["Puente de glúteos",3,"15","45 s"],["Sentadilla a banco",3,"12","60 s"],["Plancha frontal",3,"30–40 s","45 s"],["Dead bug",3,"8/lado","45 s"]]},
  homeB:{title:"Casa B · movilidad + rodilla · 15–20 min",warmup:"Objetivo: recuperar, no fatigarte.",exercises:[["Heel slides",2,"12/lado","30 s"],["Flexión de rodilla tumbado",2,"10/lado","30 s"],["TKE con banda",3,"15/lado","30–45 s"],["Wall sit parcial",3,"30–40 s","45 s"],["Movilidad de cadera y tobillo",1,"6 min","—"]]}
};

function chestPlan(week){
  if(week<=5) return {title:"Pecho prioritario + deltoide lateral + tríceps",warmup:"5–7 min + rotación externa 2×15 + face pull ligero 2×15 + 2 series de aproximación.",exercises:[["Press banca plano",4,"8–10","90 s"],["Press inclinado mancuernas",3,"8–10","90 s"],["Press declinado máquina / mancuernas",3,"10–12","75 s"],["Aperturas en polea / peck deck",3,"12–15","60 s"],["Cruce poleas arriba→abajo",3,"12–15","60 s"],["Elevaciones laterales",3,"15","45–60 s"],["Tríceps cuerda",3,"10–12","60 s"]]};
  if(week<=7) return {title:"Pecho prioritario · volumen + parte baja/central",warmup:"Hombro/escápula + 2 series de aproximación. Deja 1–2 reps en recámara.",exercises:[["Press banca plano",4,"6–8","90–120 s"],["Press inclinado mancuernas",3,"8–10","90 s"],["Fondos asistidos torso inclinado",3,"8–10","90 s"],["Press convergente máquina",3,"10–12","75 s"],["Cruce poleas medio",3,"12–15","60 s"],["Aperturas inclinadas ligeras",2,"15","60 s"],["Elevaciones laterales",3,"12–15","60 s"],["Extensión tríceps sobre cabeza",2,"12","60 s"]]};
  if(week<=9) return {title:"Pecho prioritario · anchura + densidad",warmup:"5–7 min + movilidad hombro + 2 series progresivas del primer press.",exercises:[["Press inclinado mancuernas",4,"8–10","90 s"],["Press banca plano",4,"8","90 s"],["Press declinado / fondos asistidos",3,"8–10","90 s"],["Aperturas en polea desde abajo",3,"12–15","60 s"],["Cruce poleas arriba→abajo",3,"12–15","60 s"],["Squeeze press mancuernas",2,"12–15","60 s"],["Elevaciones laterales",4,"12–15","60 s"],["Tríceps cuerda",2,"12","60 s"]]};
  if(week<=11) return {title:"Pecho prioritario · intensificación controlada",warmup:"Calentamiento completo de hombro + varias series de aproximación. Nada de fallo en presses.",exercises:[["Press banca plano",5,"5–6","120 s"],["Press inclinado mancuernas",3,"8–10","90 s"],["Press declinado máquina",3,"8–10","90 s"],["Fondos asistidos / press convergente",3,"8–10","90 s"],["Cruce de poleas",3,"12–15","60 s"],["Aperturas máquina",2,"15","60 s"],["Elevaciones laterales",3,"15","45–60 s"],["Tríceps polea",2,"12","60 s"]]};
  return {title:"Pecho prioritario · descarga",warmup:"Semana 12: técnica, recorrido limpio y sin buscar récords.",exercises:[["Press banca plano",3,"8","90 s"],["Press inclinado mancuernas",3,"10","75 s"],["Press declinado / fondos asistidos",2,"10","75 s"],["Cruce de poleas",2,"15","60 s"],["Aperturas máquina",2,"15","60 s"],["Elevaciones laterales",3,"15","60 s"],["Tríceps cuerda",2,"12","60 s"]]};
}

function planFor(session,week){
  if(session==="chest") return chestPlan(week);
  const p=structuredClone(basePlans[session]);
  if(session==="leg" && week>=8 && week<=11){p.exercises[0][2]="8–10";p.exercises[1][2]="8–10";}
  if(session==="back" && week>=8 && week<=11){p.exercises[0][2]="8";p.exercises[1][2]="10/lado";}
  if(week===12 && (session==="leg"||session==="back")){p.exercises=p.exercises.map(([n,s,r,rest])=>[n,Math.max(2,Math.min(3,s)),r,rest]);p.warmup+=" Semana de descarga: reduce carga y evita el fallo.";}
  return p;
}

const isoDate=()=>new Date().toISOString().slice(0,10);
const fmtDate=v=>v?new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(v)):"—";
function status(id,msg,type=""){const el=$(id);el.textContent=msg;el.style.color=type==="error"?"#991b1b":type==="ok"?"#166534":"";}

for(let w=4;w<=12;w++){const o=document.createElement("option");o.value=w;o.textContent=`Semana ${w}`;$("weekSelect").appendChild(o);} 
$("weekSelect").value="4";$("measureDate").value=isoDate();$("nutritionDate").value=isoDate();$("recoveryDate").value=isoDate();

document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(btn.dataset.page).classList.add("active");$("pageTitle").textContent=btn.dataset.title;}));

async function showState(){
  $("authView").classList.toggle("hidden",!!currentUser);$("mainView").classList.toggle("hidden",!currentUser);
  if(currentUser) await refreshAll();
}

$("authForm").addEventListener("submit",async e=>{e.preventDefault();status("authMsg","Entrando...");const {error}=await supabase.auth.signInWithPassword({email:$("emailInput").value.trim(),password:$("passwordInput").value});if(error)return status("authMsg",error.message,"error");status("authMsg","Acceso correcto","ok");});
$("signupBtn").addEventListener("click",async()=>{const email=$("emailInput").value.trim(),password=$("passwordInput").value;if(!email||password.length<6)return status("authMsg","Introduce email y una contraseña de al menos 6 caracteres.","error");const {data,error}=await supabase.auth.signUp({email,password});if(error)return status("authMsg",error.message,"error");status("authMsg",data.session?"Cuenta creada y sesión iniciada.":"Cuenta creada. Revisa tu email para confirmar el registro.","ok");});
$("logoutBtn").addEventListener("click",()=>supabase.auth.signOut());
supabase.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;showState();});

async function latestExerciseSummary(name){
  const {data}=await supabase.from("workout_sets").select("weight_kg,reps,completed_at,set_number").eq("user_id",currentUser.id).eq("exercise_name",name).order("completed_at",{ascending:false}).limit(8);
  if(!data?.length)return "Sin histórico";
  const day=data[0].completed_at.slice(0,10);return data.filter(x=>x.completed_at.slice(0,10)===day).sort((a,b)=>a.set_number-b.set_number).map(x=>`${x.weight_kg??0} kg × ${x.reps??0}`).join(" · ");
}

async function renderWorkout(){
  if(!currentUser)return;const week=Number($("weekSelect").value),session=$("sessionSelect").value,plan=planFor(session,week);$("todayWorkout").textContent=plan.title;$("todayWorkoutHint").textContent=`Semana ${week}`;$("warmupCard").classList.remove("hidden");$("warmupCard").innerHTML=`<div class="card-title">Calentamiento / pauta</div><div>${plan.warmup}</div>`;const list=$("exerciseList");list.innerHTML="";
  for(const ex of plan.exercises){const [name,sets,reps,rest]=ex;const card=document.createElement("div");card.className="exercise-card";const last=await latestExerciseSummary(name);card.innerHTML=`<div class="exercise-head"><div><div class="exercise-name">${name}</div><div class="last-session">Última vez: ${last}</div></div><div class="exercise-target">${sets} series · ${reps}<br>Descanso ${rest}</div></div><div class="set-box"></div>`;const box=card.querySelector(".set-box");for(let s=1;s<=Number(sets);s++){const row=document.createElement("div");row.className="set-row";row.dataset.exercise=name;row.dataset.set=s;row.innerHTML=`<span class="set-label">S${s}</span><input class="kg" type="number" min="0" max="500" step="0.5" placeholder="kg"><input class="reps" type="number" min="0" max="200" step="1" placeholder="reps"><input class="rpe" type="number" min="1" max="10" step="0.5" placeholder="RPE">`;box.appendChild(row);}list.appendChild(card);}
}
$("weekSelect").addEventListener("change",renderWorkout);$("sessionSelect").addEventListener("change",renderWorkout);

$("saveWorkoutBtn").addEventListener("click",async()=>{
  status("workoutMsg","Guardando...");const week=Number($("weekSelect").value),plan=planFor($("sessionSelect").value,week);const {data:ws,error:wErr}=await supabase.from("workout_sessions").insert({user_id:currentUser.id,week_number:week,title:plan.title,started_at:new Date().toISOString(),completed_at:new Date().toISOString(),notes:$("workoutNotes").value.trim()||null}).select("id").single();if(wErr)return status("workoutMsg",wErr.message,"error");
  const payload=[...document.querySelectorAll("#exerciseList .set-row")].map(row=>{const kg=row.querySelector(".kg").value,reps=row.querySelector(".reps").value,rpe=row.querySelector(".rpe").value;return{user_id:currentUser.id,workout_session_id:ws.id,exercise_name:row.dataset.exercise,set_number:Number(row.dataset.set),weight_kg:kg===""?null:Number(kg),reps:reps===""?null:Number(reps),rpe:rpe===""?null:Number(rpe)};}).filter(x=>x.weight_kg!==null||x.reps!==null||x.rpe!==null);
  if(payload.length){const {error}=await supabase.from("workout_sets").insert(payload);if(error)return status("workoutMsg",error.message,"error");}
  status("workoutMsg","Entrenamiento guardado ✓","ok");$("workoutNotes").value="";await renderRecentWorkouts();await renderWorkout();
});

async function renderRecentWorkouts(){const {data}=await supabase.from("workout_sessions").select("title,week_number,completed_at").eq("user_id",currentUser.id).order("completed_at",{ascending:false}).limit(6);const el=$("recentWorkouts");if(!data?.length){el.textContent="Todavía no hay entrenamientos.";return;}el.innerHTML="";data.forEach(x=>{const d=document.createElement("div");d.className="list-item";d.innerHTML=`<strong>${x.title}</strong><br><span>Semana ${x.week_number??"—"} · ${fmtDate(x.completed_at)}</span>`;el.appendChild(d);});}

$("measurementForm").addEventListener("submit",async e=>{e.preventDefault();status("measurementMsg","Guardando...");const payload={user_id:currentUser.id,measured_at:new Date(`${$("measureDate").value}T08:00:00`).toISOString(),weight_kg:Number($("weightInput").value),body_fat_pct:$("fatInput").value===""?null:Number($("fatInput").value),visceral_fat:$("visceralInput").value===""?null:Number($("visceralInput").value),muscle_mass_kg:$("muscleInput").value===""?null:Number($("muscleInput").value),body_water_pct:$("waterPctInput").value===""?null:Number($("waterPctInput").value),waist_cm:$("waistInput").value===""?null:Number($("waistInput").value),hip_cm:$("hipInput").value===""?null:Number($("hipInput").value),thigh_cm:$("thighInput").value===""?null:Number($("thighInput").value),source:"manual"};const {error}=await supabase.from("body_measurements").insert(payload);if(error)return status("measurementMsg",error.message,"error");status("measurementMsg","Medición guardada ✓","ok");await renderMeasurements();});

async function renderMeasurements(){const {data}=await supabase.from("body_measurements").select("measured_at,weight_kg,body_fat_pct,waist_cm,hip_cm,thigh_cm").eq("user_id",currentUser.id).order("measured_at",{ascending:false}).limit(12);const el=$("measurementHistory");if(!data?.length){el.textContent="Todavía no hay mediciones.";return;}const x=data[0];$("homeWeight").textContent=x.weight_kg!=null?`${x.weight_kg} kg`:"—";$("homeWaist").textContent=x.waist_cm!=null?`${x.waist_cm} cm`:"—";$("metricWeight").textContent=x.weight_kg!=null?`${x.weight_kg} kg`:"—";$("metricWaist").textContent=x.waist_cm!=null?`${x.waist_cm} cm`:"—";$("metricFat").textContent=x.body_fat_pct!=null?`${x.body_fat_pct}%`:"—";el.innerHTML="";data.forEach(m=>{const d=document.createElement("div");d.className="list-item";d.innerHTML=`<strong>${fmtDate(m.measured_at)} · ${m.weight_kg??"—"} kg</strong><br><span>Grasa ${m.body_fat_pct??"—"}% · Cintura ${m.waist_cm??"—"} cm · Cadera ${m.hip_cm??"—"} cm · Muslo ${m.thigh_cm??"—"} cm</span>`;el.appendChild(d);});}

$("saveNutritionBtn").addEventListener("click",async()=>{status("nutritionMsg","Guardando...");const payload={user_id:currentUser.id,log_date:$("nutritionDate").value,calories:$("caloriesInput").value===""?null:Number($("caloriesInput").value),protein_g:$("proteinInput").value===""?null:Number($("proteinInput").value),carbs_g:$("carbsInput").value===""?null:Number($("carbsInput").value),fat_g:$("fatMacroInput").value===""?null:Number($("fatMacroInput").value),water_l:$("waterInput").value===""?null:Number($("waterInput").value),fasting_hours:$("fastingInput").value===""?null:Number($("fastingInput").value),creatine:$("creatineCheck").checked,d3_k2:$("d3Check").checked,magnesium:$("magnesiumCheck").checked,notes:$("nutritionNotes").value.trim()||null};const {error}=await supabase.from("nutrition_logs").upsert(payload,{onConflict:"user_id,log_date"});if(error)return status("nutritionMsg",error.message,"error");status("nutritionMsg","Día guardado ✓","ok");});

$("saveRecoveryBtn").addEventListener("click",async()=>{status("recoveryMsg","Guardando...");const payload={user_id:currentUser.id,log_date:$("recoveryDate").value,right_knee:Number($("rightKneeInput").value||0),left_knee:Number($("leftKneeInput").value||0),right_rectus_femoris:Number($("rightRFInput").value||0),left_rectus_femoris:Number($("leftRFInput").value||0),right_rectus_tightness:$("rightTightnessInput").value,energy:$("energyInput").value===""?null:Number($("energyInput").value),sleep_hours:$("sleepInput").value===""?null:Number($("sleepInput").value),notes:$("recoveryNotes").value.trim()||null};const {error}=await supabase.from("recovery_logs").upsert(payload,{onConflict:"user_id,log_date"});if(error)return status("recoveryMsg",error.message,"error");status("recoveryMsg","Recuperación guardada ✓","ok");});

async function refreshAll(){await Promise.all([renderMeasurements(),renderRecentWorkouts()]);await renderWorkout();}

if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
const {data}=await supabase.auth.getSession();currentUser=data.session?.user||null;await showState();
