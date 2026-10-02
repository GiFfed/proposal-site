const CODE = "аститька"; // TODO: поставь свой код
const body = document.body, boot = document.getElementById("boot");

const lines = [
  "инициализация ядра…",
  "поиск органических модулей…",
  "обнаружен живой контур",
  "синхронизация…",
  "система проснулась"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

async function run(){
  if(reduced){ body.classList.add("alive"); return; }
  body.classList.add("grow");
  for(let i = 0; i < lines.length; i++){
    const row = document.createElement("div");
    row.className = "cur";
    boot.appendChild(row);
    for(const ch of lines[i]){ row.textContent += ch; await sleep(28); }
    row.classList.remove("cur");
    const ok = document.createElement("span");
    ok.className = "ok"; ok.textContent = i === lines.length - 1 ? "  ✓" : "  ок";
    row.appendChild(ok);
    await sleep(380);
  }
  await sleep(700);
  body.classList.add("alive");
}
run();

// глитч: срабатывает при наведении и сам раз в несколько секунд
const h = document.querySelector(".glitch");
setInterval(() => {
  if(!body.classList.contains("alive")) return;
  h.classList.remove("go"); void h.offsetWidth; h.classList.add("go");
}, 4500);

// проверка кода
const input = document.getElementById("code"), msg = document.getElementById("msg");
function check(){
  if(input.value.trim().toLowerCase() === CODE.toLowerCase()){
  msg.style.color = "var(--glow)"; msg.textContent = "доступ разрешён";
  startUma();
}else{
    msg.style.color = "#ff6b86"; msg.textContent = "код не подошёл, ты знаешь к кому обратиться.";
    input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
  }
}
document.getElementById("go").onclick = check;
input.addEventListener("keydown", e => { if(e.key === "Enter") check(); });
