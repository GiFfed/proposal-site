/* ===== Финал: признание =====
   Включается сам после события "stage:done" с detail "personal". */

// --- текст по экранам (каждая строка = один экран) ---
const FIN_SCREENS = [
  "До этого момента я никогда никому не делал что-то подобное.",
  "Как ты догадалась, фанатик культа — это я. В данный момент, я сижу у себя в комнате и отправил тебе ссылку на сайт, чтобы ты не чувствовала давления на себя.",
  "Каждый раз, когда я смотрю на тебя, я вижу много улыбки и доброты в твоих глазах. Я хотел сказать тебе это ещё в момент когда мы гуляли впервые, но не решился: думал, что тебя это напугает.",
  "Мне нравится, чем ты увлечена, хоть я и не понимаю многого. То, как ты преподаёшь мне информацию о своих увлечениях, делает эти увлечения интересными и для меня.",
  "Мне нравится твоя разговорчивость, твоё выражение эмоций, твои увлечения, то, как ты смотришь на меня. Твои истории вдохновляют меня.",
  "Я очень боюсь писать это, но ты мне нравишься. Я испытываю тёплые чувства, когда ты рядом. Оно похоже на тёплый кофе по утрам со вкусным завтраком, я давно такого не испытывал.",
  "Ты не должна отвечать сразу. Я понимаю, что это неожиданно, но всё же я пойму, если ты откажешь. Я просто хотел, чтобы ты это знала что я чувствую к тебе...",
  "Пожалуйста, напиши мне в любое удобное время, или скажи в жизни, я не хочу давить на тебя, но мне это важно. "
];
const FIN_NEXT = "дальше ›";
// ----------------------

const initFinal = () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  document.body.insertAdjacentHTML("beforeend", `
    <section id="fin" aria-label="Финал" style="position:fixed;inset:0;visibility:hidden">
      <div class="win" id="fin-win">
        <div class="bar" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="body">
          <p id="fin-text" aria-live="polite"></p>
          <svg id="cup" viewBox="0 0 60 60" aria-hidden="true">
            <path class="steam s1" d="M20 24c-4-4 3-7-1-12"/><path class="steam s2" d="M30 24c-4-4 3-7-1-12"/>
            <path class="steam s3" d="M40 24c-4-4 3-7-1-12"/>
            <path class="c" d="M12 30h34v8a15 15 0 0 1-15 15h-4a15 15 0 0 1-15-15z"/>
            <path class="c" d="M46 33h3a6 6 0 0 1 0 12h-5"/>
          </svg>
        </div>
        <div class="foot">
          <div class="dots" id="fin-dots" aria-hidden="true">${FIN_SCREENS.map(() => "<i></i>").join("")}</div>
          <button id="fin-next">${FIN_NEXT}</button>
        </div>
      </div>
    </section>`);

  const $ = id => document.getElementById(id);
  const sec = $("fin"), win = $("fin-win"), text = $("fin-text"), next = $("fin-next"),
        cup = $("cup"), dots = [...$("fin-dots").children];
  let resolveNext = null, started = false;

  const waitNext = () => new Promise(r => { resolveNext = r; });
  const advance = () => { if(resolveNext){ const r = resolveNext; resolveNext = null; r(); } };
  next.onclick = advance;
  document.addEventListener("keydown", e => {
    if(["Enter", " ", "ArrowRight"].includes(e.key) && resolveNext){ e.preventDefault(); advance(); }
  });

  async function reveal(str){
    text.innerHTML = "";
    const spans = str.split(" ").map(w => {
      const s = document.createElement("span");
      s.className = "w"; s.textContent = w;
      text.append(s, " ");
      return s;
    });
    void text.offsetWidth;
    for(const s of spans){
      s.classList.add("in");
      await sleep(/[.!?…:]$/.test(s.textContent) ? 520 : 120);   // пауза после предложений
    }
  }

  window.startFinal = async function(){
    if(started) return; started = true;
    const prev = $("pers");
    if(prev){ prev.style.transition = "opacity 1.2s"; prev.style.opacity = "0"; await sleep(1300); prev.style.visibility = "hidden"; }
    document.documentElement.classList.add("warm");           // холодный терминал становится тёплым
    await sleep(3500);
    sec.style.visibility = "visible";
    void win.offsetWidth;
    win.classList.add("show");
    await sleep(1600);

    for(let i = 0; i < FIN_SCREENS.length; i++){
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      text.classList.remove("out");
      await reveal(FIN_SCREENS[i]);
      if(i < FIN_SCREENS.length - 1){
        await sleep(700);
        next.classList.add("show");
        await waitNext();                                      // читает в своём темпе
        next.classList.remove("show");
        text.classList.add("out");
        await sleep(850);
      }else{
        await sleep(900);
        cup.classList.add("show");                             // последний экран: чашка с паром
      }
    }
  };
  document.addEventListener("stage:done", e => { if(e.detail === "personal") window.startFinal(); });
};

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFinal);
else initFinal();
