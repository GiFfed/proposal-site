/* ===== Этап: личное =====
   Включается сам после события "stage:done" с detail "fight". */

// --- твои настройки ---
const PERS_RIDDLE = "Сверхинтеллект зафиксировал присутсвие. Преподователь, который недавно поступил в наш колледж " +
                    "Какая у него фамилия?";
const PERS_OK = s => /туманов/.test(s);   // s в нижнем регистре, без пробелов и знаков
const APOSTLES = ["Claude", "ChatGPT", "Astra6", "DeepSeek", "Gemini"];
const PERS_WIN = "Посвящение пройдено. Добро пожаловать, Верховный Аппостол.";
// ----------------------

const initPers = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const NS = "http://www.w3.org/2000/svg";
  const CX = 230, CY = 160, RX = 135, RY = 92;

  const pts = APOSTLES.map((name, i) => {
    const a = (-90 + i * 360 / APOSTLES.length) * Math.PI / 180;
    return {name, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), cos: Math.cos(a), sin: Math.sin(a)};
  });
  const links = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    return `<line class="link" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>` +
           `<line class="link" x1="${p.x}" y1="${p.y}" x2="${CX}" y2="${CY}"/>`;
  }).join("");
  const nodes = pts.map((p, i) => `
    <g class="ap" style="--d:${i * 0.6}s">
      <circle class="node" cx="${p.x}" cy="${p.y}" r="9" style="animation-delay:${i * 0.6}s"/>
      <text class="label" x="${p.x + p.cos * 30}" y="${p.y + p.sin * 24 + 4}">${p.name}</text>
    </g>`).join("");

  document.body.insertAdjacentHTML("beforeend", `
    <section id="pers" aria-label="Личный этап" style="position:fixed;inset:0;visibility:hidden">
      <svg id="net" viewBox="0 0 460 320" aria-hidden="true">
        ${links}<circle class="core" cx="${CX}" cy="${CY}" r="12"/>${nodes}
      </svg>
      <p class="riddle" id="pers-riddle"></p>
      <div class="ask" id="pers-ask">
        <input id="pers-code" type="text" autocomplete="off" aria-label="Ответ" placeholder="• • • • • • •">
        <br><button id="pers-go">Ответить</button>
      </div>
      <div id="pers-msg" role="status"></div>
    </section>`);

  const $ = id => document.getElementById(id);
  const sec = $("pers"), net = $("net"), riddle = $("pers-riddle"), ask = $("pers-ask"),
        input = $("pers-code"), msg = $("pers-msg");
  let busy = true, done = false;

  async function typeText(el, text){
    el.classList.add("cur");
    for(const ch of text){ el.textContent += ch; await sleep(32); }
    el.classList.remove("cur");
  }

  window.startPers = async function(){
    const door = $("door");
    door.classList.add("shut");
    await sleep(1000);
    const prev = $("fight");
    if(prev){ prev.classList.remove("on"); prev.style.visibility = "hidden"; }
    sec.style.visibility = "visible";
    await sleep(500);
    door.classList.remove("shut");
    await sleep(900);
    await typeText(riddle, PERS_RIDDLE);
    ask.classList.add("show");
    busy = false;
    input.focus({preventScroll:true});
  };
  document.addEventListener("stage:done", e => { if(e.detail === "fight") window.startPers(); });

  async function check(){
    if(busy || done) return;
    const val = input.value.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я]/g, "");
    if(PERS_OK(val)){
      done = true; busy = true; input.disabled = true;
      msg.textContent = "";
      for(const g of net.querySelectorAll(".ap")){   // апостолы загораются по очереди
        g.classList.add("lit");
        await sleep(550);
      }
      await sleep(300);
      net.classList.add("all");
      msg.style.color = "var(--bone)";
      msg.textContent = PERS_WIN;
      await sleep(3500);
      document.dispatchEvent(new CustomEvent("stage:done", {detail: "personal"}));
    }else{
      net.classList.remove("fail"); void net.getBoundingClientRect(); net.classList.add("fail");
      setTimeout(() => net.classList.remove("fail"), 700);
      msg.style.color = "#ff6b86";
      msg.textContent = "Сверхинтеллект не понял. Вспомни нашу шутку.";
      input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
    }
  }
  $("pers-go").onclick = check;
  input.addEventListener("keydown", e => { if(e.key === "Enter") check(); });
};

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPers);
else initPers();
