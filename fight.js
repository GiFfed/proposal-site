/* ===== Этап: файтинг =====
   Включается сам после события "stage:done" с detail "xeno". */

// --- твои настройки ---
const FIGHT_RIDDLE = "Раунд выигран, но враг ещё стоит. Как называется добивающий приём? "; 
const FIGHT_OK = s => /fatality|фаталити/.test(s);  // s в нижнем регистре, без пробелов и знаков
const FIGHT_HIT = 34;                               // сколько HP% теряешь за ошибку (3 ошибки = K.O.)
// ----------------------

const initFight = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  document.body.insertAdjacentHTML("beforeend", `
    <section id="fight" aria-label="Этап-файтинг">
      <div id="hud" aria-hidden="true">
        <div class="side" id="p1"><span>ТЫ</span><div class="hp"><i class="trail"></i><i class="fill"></i></div></div>
        <div class="vs">VS</div>
        <div class="side right" id="p2"><span>???</span><div class="hp"><i class="trail"></i><i class="fill"></i></div></div>
      </div>
      <div id="fbanner" aria-hidden="true"></div>
      <div class="fbody">
        <p class="riddle" id="fight-riddle"></p>
        <div class="ask" id="fight-ask">
          <input id="fight-code" type="text" autocomplete="off" aria-label="Ответ" placeholder="• • • • • • •">
          <br><button id="fight-go">Ударить</button>
        </div>
        <div id="fight-msg" role="status"></div>
      </div>
    </section>`);

  const $ = id => document.getElementById(id);
  const sec = $("fight"), banner = $("fbanner"), riddle = $("fight-riddle"), ask = $("fight-ask"),
        input = $("fight-code"), msg = $("fight-msg");
  let hp = 100, busy = true, done = false;

  function setHp(side, pct){
    const bar = $(side).querySelector(".hp");
    bar.querySelector(".fill").style.width = pct + "%";
    bar.querySelector(".trail").style.width = pct + "%";
    bar.classList.toggle("low", pct <= FIGHT_HIT);
  }
  const shake = el => { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); };
  async function show(text, ms = 1300, ko = false){
    banner.className = ""; void banner.offsetWidth;
    banner.textContent = text;
    banner.style.setProperty("--bt", ms + "ms");
    banner.className = "go" + (ko ? " ko" : "");
    await sleep(ms);
  }
  async function typeText(el, text){
    el.classList.add("cur");
    for(const ch of text){ el.textContent += ch; await sleep(30); }
    el.classList.remove("cur");
  }

  window.startFight = async function(){
    const door = $("door");
    door.classList.add("shut");
    await sleep(1000);
    const prev = $("xeno"); if(prev) prev.classList.remove("on");
    sec.classList.add("on");
    await sleep(500);
    door.classList.remove("shut");
    await sleep(900);
    await show("ROUND 1", 1300);
    await show("FIGHT!", 1000);
    await typeText(riddle, FIGHT_RIDDLE);
    ask.classList.add("show");
    busy = false;
    input.focus({preventScroll:true});
  };
  document.addEventListener("stage:done", e => { if(e.detail === "xeno") window.startFight(); });

  async function check(){
    if(busy || done) return;
    const val = input.value.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я]/g, "");
    busy = true;
    if(FIGHT_OK(val)){
      done = true; input.disabled = true;
      setHp("p2", 0);
      await sleep(700);
      const fl = $("xflash"); if(fl){ fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go"); }
      shake(sec);
      await show("K.O.", 1800, true);
      msg.style.color = "var(--glow)";
      msg.textContent = "Победа! Ты справилась.";
      await sleep(2000);
      document.dispatchEvent(new CustomEvent("stage:done", {detail: "fight"}));
      return;
    }
    // ошибка: удар по тебе
    hp = Math.max(0, hp - FIGHT_HIT);
    setHp("p1", hp);
    shake(sec); shake(input);
    msg.style.color = "#ff6b86";
    if(hp > 0){
      msg.textContent = "Мимо! Тебе прилетело.";
    }else{
      await sleep(500);
      await show("K.O.", 1500, true);
      for(let n = 3; n > 0; n--){ msg.textContent = "CONTINUE? " + n; await sleep(800); }
      hp = 100; setHp("p1", hp);
      msg.style.color = "var(--glow)";
      msg.textContent = "Ещё раунд. Давай снова.";
    }
    busy = false;
  }
  $("fight-go").onclick = check;
  input.addEventListener("keydown", e => { if(e.key === "Enter") check(); });
};

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFight);
else initFight();
