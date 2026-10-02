/* ===== Этап: Ума =====
   Подключение: <script src="uma.js"></script> и вызов startUma() при верном коде на входе. */

// --- твои настройки ---
const UMA_RIDDLE = "За тобой наблюдают. Имя того, кто смотрит, спрятано в цифрах: " +
                   "А=1, Б=2, В=3… Склей числа в один код.";
const UMA_ANSWERS = ["21141", "20131"]; // с буквой Ё в алфавите и без неё
// ----------------------

const initUma = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // разметку создаём сами, чтобы index.html не трогать
  document.body.insertAdjacentHTML("beforeend", `
    <div id="door" aria-hidden="true"><i class="l"></i><i class="r"></i><b></b></div>
    <section id="uma" aria-label="Этап с Умой">
      <svg id="eyes" class="closed" viewBox="0 0 400 160" aria-hidden="true">
        <defs>
          <radialGradient id="ig"><stop offset="0" style="stop-color:var(--glow);stop-opacity:.35"/>
            <stop offset="1" style="stop-color:var(--bg)"/></radialGradient>
        </defs>
        <g class="eye" id="eye-l"><ellipse class="iris" cx="110" cy="80" rx="70" ry="48" fill="url(#ig)"/>
          <g class="pp"><ellipse class="pupil" cx="110" cy="80" rx="9" ry="36"/></g></g>
        <g class="eye" id="eye-r"><ellipse class="iris" cx="290" cy="80" rx="70" ry="48" fill="url(#ig)"/>
          <g class="pp"><ellipse class="pupil" cx="290" cy="80" rx="9" ry="36"/></g></g>
      </svg>
      <p class="riddle" id="riddle"></p>
      <div class="ask" id="ask">
        <input id="uma-code" type="text" inputmode="numeric" autocomplete="off" aria-label="Код" placeholder="• • • •">
        <br><button id="uma-go">Проверить</button>
      </div>
      <div id="uma-msg" role="status"></div>
    </section>`);

  const $ = id => document.getElementById(id);
  const door = $("door"), sec = $("uma"), eyes = $("eyes"), riddle = $("riddle"),
        ask = $("ask"), input = $("uma-code"), msg = $("uma-msg");
  const pupils = [...eyes.querySelectorAll(".pp")];
  const eyeEls = [...eyes.querySelectorAll(".eye")];
  let active = false, done = false;

  // зрачки следят за курсором/пальцем
  function look(x, y){
    eyeEls.forEach((eye, i) => {
      const r = eye.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      const k = Math.min(1, Math.hypot(dx, dy) / 250), a = Math.atan2(dy, dx);
      pupils[i].style.transform = `translate(${Math.cos(a) * 30 * k}px,${Math.sin(a) * 12 * k}px)`;
    });
  }
  addEventListener("pointermove", e => active && !done && look(e.clientX, e.clientY));

  // моргание
  (async function blinker(){
    while(true){
      await sleep(2500 + Math.random() * 3500);
      if(!active || done) continue;
      eyeEls.forEach(e => e.classList.add("blink"));
      await sleep(140);
      eyeEls.forEach(e => e.classList.remove("blink"));
    }
  })();

  async function typeText(el, text){
    el.classList.add("cur");
    for(const ch of text){ el.textContent += ch; await sleep(30); }
    el.classList.remove("cur");
  }

  // переход: дверь закрывается, за ней меняем экран, дверь раскрывается
  window.startUma = async function(){
    door.classList.add("shut");
    await sleep(1000);
    const main = document.getElementById("main");
    if(main) main.style.display = "none";
    sec.classList.add("on");
    await sleep(500);
    door.classList.remove("shut");
    await sleep(800);
    active = true;
    eyes.classList.add("waking");
    eyes.classList.remove("closed");              // глаза открываются
    await sleep(1000);
    await typeText(riddle, UMA_RIDDLE);
    ask.classList.add("show");
    input.focus({preventScroll:true});
  };

  function check(){
    if(done) return;
    const val = input.value.replace(/\D/g, "");
    if(UMA_ANSWERS.includes(val)){
      done = true;
      msg.style.color = "var(--glow)";
      msg.textContent = "Ума мурлычет. Код принят.";
      eyes.classList.add("happy");
      pupils.forEach(p => p.style.transform = "translate(0,0)");
      input.disabled = true;
      setTimeout(() => document.dispatchEvent(new CustomEvent("stage:done", {detail: "uma"})), 2400);
    }else{
      msg.style.color = "#ff6b86";
      msg.textContent = "Ума щурится: код не подошёл. Проверь, как считаются буквы.";
      eyes.classList.add("alert");
      setTimeout(() => eyes.classList.remove("alert"), 900);
      input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
    }
  }
  $("uma-go").onclick = check;
  input.addEventListener("keydown", e => { if(e.key === "Enter") check(); });
};

// работает, даже если скрипт подключён в <head>
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initUma);
else initUma();
