// Umbrella page for synergify.com — self-contained, no external assets (CSP-clean).
export const PAGE_HTML = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Synergify</title>
<meta name="description" content="Synergify — открытый курс «Точка Сборки» и закрытая академия S.A.S.H.A.">
<style>
  :root {
    --bg: #0b0d10;
    --surface: #12151a;
    --text: #e8eaed;
    --muted: #9aa3ad;
    --accent: #7aa2f7;
    --gold: #d9a95c;
    --border: #232830;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { min-height: 100%; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 48rem; width: 100%; }
  .hero { text-align: center; margin-bottom: 1.5rem; }
  h1 {
    font-size: clamp(2.4rem, 9vw, 4.2rem);
    font-weight: 700;
    letter-spacing: 0;
    color: var(--text);
  }
  .subtitle { margin-top: 0.8rem; color: var(--muted); line-height: 1.55; font-size: 1.05rem; }
  .entries { display: grid; grid-template-columns: 1fr; gap: 0.9rem; margin-top: 1.7rem; }
  .entry {
    display: flex;
    min-height: 12rem;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.2rem;
    padding: 1.2rem;
    border: 1px solid var(--border);
    border-radius: 0.8rem;
    background: var(--surface);
    color: inherit;
    text-decoration: none;
  }
  .entry:hover { border-color: var(--accent); }
  .entry.academy:hover { border-color: var(--gold); }
  .entry h2 { font-size: 1.35rem; line-height: 1.2; letter-spacing: 0; }
  .entry p { color: var(--muted); line-height: 1.5; }
  .cta { color: var(--accent); font-weight: 700; }
  .academy .cta { color: var(--gold); }
  .subscribe { max-width: 30rem; margin: 2rem auto 0; text-align: center; }
  .subscribe p { color: var(--muted); line-height: 1.5; }
  form { margin-top: 0.8rem; display: grid; grid-template-columns: 1fr; gap: 0.6rem; }
  input[type="email"] {
    width: 100%;
    padding: 0.75rem 0.9rem;
    border-radius: 0.6rem;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 1rem;
  }
  input[type="email"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; border-color: transparent; }
  button {
    padding: 0.75rem 0.9rem;
    border-radius: 0.6rem;
    border: none;
    background: var(--accent);
    color: #0b0d10;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
  }
  button:hover { filter: brightness(1.08); }
  button:disabled { opacity: 0.6; cursor: default; }
  .hp { position: absolute; left: -9999px; top: -9999px; height: 1px; width: 1px; overflow: hidden; }
  #msg { margin-top: 0.9rem; min-height: 1.4em; font-size: 0.95rem; color: var(--muted); }
  #msg.ok { color: #9ece6a; }
  #msg.err { color: #f7768e; }
  .en { margin-top: 2rem; color: var(--muted); font-size: 0.86rem; line-height: 1.5; text-align: center; }
  @media (min-width: 560px) {
    .entries { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    form { grid-template-columns: minmax(0, 1fr) auto; }
  }
</style>
</head>
<body>
<main>
  <section class="hero">
    <h1>Synergify</h1>
    <p class="subtitle">Экосистема обучения: открытый курс и закрытая академия.</p>
  </section>
  <section class="entries" aria-label="Входы Synergify">
    <a class="entry" href="https://ai.synergify.com">
      <span>
        <h2>Точка Сборки</h2>
        <p>Открытый курс по agentic AI — для всех, бесплатно.</p>
      </span>
      <span class="cta">Начать →</span>
    </a>
    <a class="entry academy" href="https://academy.synergify.com">
      <span>
        <h2>Академия S.A.S.H.A</h2>
        <p>Закрытая школа скрытых способностей. Вход открывается после прохождения «Точки Сборки».</p>
      </span>
      <span class="cta">Узнать больше →</span>
    </a>
  </section>
  <section class="subscribe">
    <p>Новости экосистемы — без спама.</p>
    <form id="subscribe" method="post" action="/api/subscribe">
      <input type="email" name="email" placeholder="ваш@email" required autocomplete="email" aria-label="Email">
      <input type="hidden" name="lang" value="ru">
      <div class="hp" aria-hidden="true">
        <label>Не заполняйте это поле<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      <button type="submit">Подписаться</button>
    </form>
    <p id="msg" role="status" aria-live="polite"></p>
  </section>
  <p class="en">Synergify — an open course (Tochka Sborki) and a gated academy (S.A.S.H.A). The academy opens after completing the course.</p>
</main>
<script>
(function () {
  var form = document.getElementById('subscribe');
  var msg = document.getElementById('msg');

  var subscribed = new URLSearchParams(location.search).get('subscribed');
  if (subscribed) {
    if (subscribed === '1') { msg.className = 'ok'; msg.textContent = 'Готово! Проверьте почту.'; }
    else if (subscribed === 'already') { msg.className = 'ok'; msg.textContent = 'Вы уже подписаны — спасибо!'; }
    else if (subscribed === 'invalid') { msg.className = 'err'; msg.textContent = 'Проверьте адрес почты.'; }
    else { msg.className = 'err'; msg.textContent = 'Не получилось. Попробуйте позже.'; }
    history.replaceState(null, '', '/');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button');
    var email = form.querySelector('input[name="email"]').value.trim();
    var website = form.querySelector('input[name="website"]').value;
    var lang = form.querySelector('input[name="lang"]').value;
    btn.disabled = true;
    msg.className = '';
    msg.textContent = '…';
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, website: website, lang: lang })
    }).then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); })
      .then(function (res) {
        if (res.data && res.data.ok) {
          msg.className = 'ok';
          msg.textContent = res.data.already ? 'Вы уже подписаны — спасибо!' : 'Готово! Проверьте почту.';
          form.reset();
        } else if (res.status === 400) {
          msg.className = 'err';
          msg.textContent = 'Проверьте адрес почты.';
        } else {
          msg.className = 'err';
          msg.textContent = 'Не получилось. Попробуйте позже.';
        }
      })
      .catch(function () {
        msg.className = 'err';
        msg.textContent = 'Не получилось. Попробуйте позже.';
      })
      .finally(function () { btn.disabled = false; });
  });
})();
</script>
</body>
</html>
`
