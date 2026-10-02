/* ===== Этап: датчик движения =====
   Включается сам, когда этап с Умой присылает событие "stage:done". */

// --- твои настройки ---
const XENO_RIDDLE = "Датчик движения засёк цель. Её облик придумал художник, " +
                    "которого называют отцом биомеханики. Назови его фамилию.";
const XENO_OK = s => /гигер|giger/.test(s);   // s уже в нижнем регистре, без пробелов и знаков
// ----------------------

const initXeno = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ANGLE = 50;                    // угол метки (градусы по часовой от «вверх»)
  const R_START = 118, R_STEP = 26, R_MIN = 36;

  document.body.insertAdjacentHTML("beforeend", `
    <section id="xeno" aria-label="Этап с датчиком движения">
      <svg id="radar" viewBox="0 0 300 300" aria-hidden="true">
        <circle class="bg" cx="150" cy="150" r="140"/>
        <circle class="ring" cx="150" cy="150" r="42"/><circle class="ring" cx="150" cy="150" r="84"/>
        <circle class="ring" cx="150" cy="150" r="126"/>
        <line class="cross" x1="150" y1="10" x2="150" y2="290"/><line class="cross" x1="10" y1="150" x2="290" y2="150"/>
        <defs><linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style="stop-color:var(--glow);stop-opacity:0"/>
          <stop offset="1" style="stop-color:var(--glow);stop-opacity:.45"/></linearGradient></defs>
        <g id="sweep"><path d="M150 150 L150 10 A140 140 0 0 0 52 50 Z" fill="url(#sw)" transform="scale(-1,1) translate(-300,0)"/></g>
        <circle class="blip" id="blip" cx="150" cy="30" r="6" style="animation-delay:.42s"/>
      </svg>
      <p class="riddle" id="xeno-riddle"></p>
      <div class="ask" id="xeno-ask">
        <input id="xeno-code" type="text" autocomplete="off" aria-label="Ответ" placeholder="• • • • •">
        <br><button id="xeno-go">Проверить</button>
      </div>
      <div id="xeno-msg" role="status"></div>
    </section>
    <svg id="tail" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M-50 520 C150 420 250 600 450 470 S750 330 1050 80"/></svg>
    <div id="xflash"></div>`);

  const $ = id => document.getElementById(id);
  const sec = $("xeno"), radar = $("radar"), blip = $("blip"), riddle = $("xeno-riddle"),
        ask = $("xeno-ask"), input = $("xeno-code"), msg = $("xeno-msg"),
        tail = $("tail"), flash = $("xflash");
  let radius = R_START, done = false;

  function place(r){
    const a = ANGLE * Math.PI / 180;
    blip.setAttribute("cx", 150 + r * Math.sin(a));
    blip.setAttribute("cy", 150 - r * Math.cos(a));
  }
  place(radius);

  async function typeText(el, text){
    el.classList.add("cur");
    for(const ch of text){ el.textContent += ch; await sleep(30); }
    el.classList.remove("cur");
  }

  // переход с этапа Умы: та же дверь
  window.startXeno = async function(){
    const door = $("door");
    door.classList.add("shut");
    await sleep(1000);
    const uma = $("uma"); if(uma) uma.classList.remove("on");
    sec.classList.add("on");
    await sleep(500);
    door.classList.remove("shut");
    await sleep(900);
    await typeText(riddle, XENO_RIDDLE);
    ask.classList.add("show");
    input.focus({preventScroll:true});
  };
  document.addEventListener("stage:done", e => { if(e.detail === "uma") window.startXeno(); });

  async function check(){
    if(done) return;
    const val = input.value.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я]/g, "");
    if(XENO_OK(val)){
      done = true; input.disabled = true;
      place(0);                                  // метка рвётся к центру
      await sleep(600);
      flash.classList.add("go");
      radar.classList.add("caught");
      tail.classList.add("go");                  // тень проползает по экрану
      msg.style.color = "var(--bone)";
      msg.textContent = "Цель была рядом. Принято.";
      await sleep(3000);
      document.dispatchEvent(new CustomEvent("stage:done", {detail: "xeno"}));
    }else{
      radius = Math.max(R_MIN, radius - R_STEP);  // с каждой ошибкой метка ближе
      place(radius);
      msg.style.color = "#ff6b86";
      msg.textContent = "Не то. Сигнал стал ближе, подумай ещё.";
      input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
    }
  }
  $("xeno-go").onclick = check;
  input.addEventListener("keydown", e => { if(e.key === "Enter") check(); });
};

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initXeno);
else initXeno();
