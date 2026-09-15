import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = id => document.getElementById(id);

let currentUser = null;
let timerInterval = null;
let timerSeconds = 0;
let timerDefault = 90;
let latestMeasurements = [];

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

const plans = {
  leg:{
    title:"Pierna + glúteo + rodilla + core",
    subtitle:"Fuerza controlada · sin explosividad",
    warmup:"Bici suave 6 min · heel slides 2×12 · flexión de rodilla tumbado 2×10 · puente glúteo 2×15 · TKE 2×15 · wall sit parcial 2×25–30 s.",
    exercises:[
      ["Prensa de piernas",4,"10–12",90],
      ["Hip thrust",4,"10–12",90],
      ["Peso muerto rumano",3,"8–10",90],
      ["Step-up bajo",3,"10/lado",75],
      ["Extensión de cuádriceps ligera",3,"12–15",60],
      ["Abducción de cadera",3,"15–20",60],
      ["Gemelos",3,"15–20",60],
      ["Pallof press",3,"12/lado",45]
    ]
  },
  back:{
    title:"Espalda + dorsal + trapecio + bíceps",
    subtitle:"Anchura dorsal + trapecio + deltoide posterior",
    warmup:"5–7 min suaves · movilidad torácica · 2 series ligeras de jalón y remo.",
    exercises:[
      ["Jalón al pecho agarre neutro",4,"8–10",90],
      ["Jalón unilateral en polea alta",4,"10–12/lado",75],
      ["Pullover en polea / brazos rectos",3,"12–15",60],
      ["Remo pecho apoyado",3,"10–12",75],
      ["Face pull",3,"15",60],
      ["Encogimientos / farmer carry",3,"10–12 / 30 m",75],
      ["Curl bíceps",3,"10–12",60]
    ]
  },
  homeA:{
    title:"Casa A · Cardio + core",
    subtitle:"20–25 min · RPE 6–7",
    warmup:"Sesión corta. Sin saltos ni HIIT agresivo. Si haces spinning: sentado, resistencia moderada y sin sprints máximos.",
    exercises:[
      ["Marcha rápida / bici / spinning suave",1,"10 min",30],
      ["Puente de glúteos",3,"15",45],
      ["Sentadilla a banco",3,"12",60],
      ["Plancha frontal",3,"30–40 s",45],
      ["Dead bug",3,"8/lado",45]
    ]
  },
  homeB:{
    title:"Casa B · Recuperación activa",
    subtitle:"15–20 min · movilidad + rodilla",
    warmup:"Objetivo: recuperar y ganar tolerancia, no fatigarte.",
    exercises:[
      ["Heel slides",2,"12/lado",30],
      ["Flexión de rodilla tumbado",2,"10/lado",30],
      ["TKE con banda",3,"15/lado",30],
      ["Wall sit parcial",3,"30–40 s",45],
      ["Movilidad de cadera y tobillo",1,"6 min",30]
    ]
  }
};

function chestPlan(week){
  if(week<=5) return {
    title:"Pecho prioritario",
    subtitle:"Base · masa + parte baja + central",
    warmup:"5–7 min · rotación externa 2×15 · face pull ligero 2×15 · 2 series de aproximación del primer press. Mantén 1–2 reps en recámara.",
    exercises:[
      ["Press banca plano",4,"8–10",90],
      ["Press inclinado mancuernas",3,"8–10",90],
      ["Press declinado máquina / mancuernas",3,"10–12",75],
      ["Aperturas en polea / peck deck",3,"12–15",60],
      ["Cruce poleas arriba→abajo",3,"12–15",60],
      ["Elevaciones laterales",3,"15",60],
      ["Tríceps cuerda",3,"10–12",60]
    ]
  };
  if(week<=7) return {
    title:"Pecho prioritario",
    subtitle:"Volumen · parte baja + central",
    warmup:"Movilidad de hombro/escápula + 2 series de aproximación. Deja 1–2 reps en reserva.",
    exercises:[
      ["Press banca plano",4,"6–8",105],
      ["Press inclinado mancuernas",3,"8–10",90],
      ["Fondos asistidos torso inclinado",3,"8–10",90],
      ["Press convergente máquina",3,"10–12",75],
      ["Cruce poleas medio",3,"12–15",60],
      ["Aperturas inclinadas ligeras",2,"15",60],
      ["Elevaciones laterales",3,"12–15",60],
      ["Extensión tríceps sobre cabeza",2,"12",60]
    ]
  };
  if(week<=9) return {
    title:"Pecho prioritario",
    subtitle:"Anchura + densidad",
    warmup:"5–7 min + movilidad hombro + 2 series progresivas del primer press.",
    exercises:[
      ["Press inclinado mancuernas",4,"8–10",90],
      ["Press banca plano",4,"8",90],
      ["Press declinado / fondos asistidos",3,"8–10",90],
      ["Aperturas en polea desde abajo",3,"12–15",60],
      ["Cruce poleas arriba→abajo",3,"12–15",60],
      ["Squeeze press mancuernas",2,"12–15",60],
      ["Elevaciones laterales",4,"12–15",60],
      ["Tríceps cuerda",2,"12",60]
    ]
  };
  if(week<=11) return {
    title:"Pecho prioritario",
    subtitle:"Intensificación controlada",
    warmup:"Calentamiento completo de hombro + varias series de aproximación. Nada de fallo en presses.",
    exercises:[
      ["Press banca plano",5,"5–6",120],
      ["Press inclinado mancuernas",3,"8–10",90],
      ["Press declinado máquina",3,"8–10",90],
      ["Fondos asistidos / press convergente",3,"8–10",90],
      ["Cruce de poleas",3,"12–15",60],
      ["Aperturas máquina",2,"15",60],
      ["Elevaciones laterales",3,"15",60],
      ["Tríceps polea",2,"12",60]
    ]
  };
  return {
    title:"Pecho prioritario",
    subtitle:"Descarga · técnica perfecta",
    warmup:"Semana 12: recorrido limpio, control y sin buscar récords.",
    exercises:[
      ["Press banca plano",3,"8",90],
      ["Press inclinado mancuernas",3,"10",75],
      ["Press declinado / fondos asistidos",2,"10",75],
      ["Cruce de poleas",2,"15",60],
      ["Aperturas máquina",2,"15",60],
      ["Elevaciones laterales",3,"15",60],
      ["Tríceps cuerda",2,"12",60]
    ]
  };
}

function planFor(session,week){
  if(session==="chest") return chestPlan(week);
  const p=structuredClone(plans[session]);
  if(week===12 && (session==="leg"||session==="back")){
    p.subtitle+=" · descarga";
    p.exercises=p.exercises.map(([n,s,r,rest])=>[n,Math.max(2,Math.min(3,s)),r,rest]);
  }
  return p;
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
supabase.auth.onAuthStateChange((_e,s)=>{currentUser=s?.user||null;showState();});

async function getExerciseHistory(name,limit=120){
  const {data,error}=await supabase.from("workout_sets")
    .select("workout_session_id,exercise_name,set_number,weight_kg,reps,rpe,completed_at")
    .eq("user_id",currentUser.id).eq("exercise_name",name)
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
  $("warmupText").textContent=plan.warmup;
  const totalSets=plan.exercises.reduce((sum,e)=>sum+Number(e[1]||0),0);
  $("sessionVolumeBadge").textContent=`${totalSets} series`;

  const list=$("exerciseList"); list.innerHTML="";
  for(const [name,sets,reps,rest] of plan.exercises){
    const history=await getExerciseHistory(name,80);
    const latest=history[0]||null;
    const suggestion=suggestNext(latest,reps);
    const card=document.createElement("article"); card.className="exercise-card";
    card.innerHTML=`
      <div class="exercise-top">
        <div class="exercise-heading">
          <div>
            <div class="exercise-name">${name}</div>
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
        if(row.classList.contains("done")) startTimer(Number(row.dataset.rest)||90);
      });
      box.appendChild(row);
    }

    card.querySelector(".copy-last").addEventListener("click",()=>{
      if(!latest) return;
      card.querySelectorAll(".set-row").forEach(row=>{
        const prev=latest.sets.find(x=>Number(x.set_number)===Number(row.dataset.set));
        populateSetRow(row,prev);
      });
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
}
$("weekSelect").addEventListener("change",renderWorkout);
$("sessionSelect").addEventListener("change",renderWorkout);

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
  status("workoutMsg","Entrenamiento guardado ✓","ok");
  $("workoutNotes").value="";
  clearInterval(timerInterval); timerSeconds=0; renderTimer();
  await Promise.all([renderWorkout(),renderRecentWorkouts()]);
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
