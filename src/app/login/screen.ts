// The entry screen is self-contained so private application assets stay behind the session gate.
export function loginScreen(invalid: boolean) {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Masuk · Senandung</title><style>
*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:clamp(1rem,5vw,5rem);background:#090c0a;color:white;font:1rem/1.5 Inter,system-ui,sans-serif}
main{width:min(100%,940px);display:grid;grid-template-columns:.95fr 1fr;overflow:hidden;border:1px solid #354039;border-radius:20px;background:#121512;box-shadow:0 32px 100px #0006}
.sleeve{background:linear-gradient(145deg,#225438,#173d29 60%,#10271b);min-height:480px;position:relative;overflow:hidden;padding:2rem;isolation:isolate}
.brand{color:#1ed760;font-weight:850;letter-spacing:-.06em;font-size:1.8rem;position:relative;z-index:1}
.record{position:absolute;width:115%;aspect-ratio:1;border-radius:50%;left:9%;bottom:-17%;background:radial-gradient(circle,#0f1912 0 1.3%,#a7e7aa 1.5% 4%,#62ca87 4% 18%,transparent 18.5%),repeating-radial-gradient(circle,transparent 0 3px,#8fbd9a38 3.6px 4px),conic-gradient(from 45deg,#141d18,#526958 20%,#111b14 35%,#2b392d 60%,#75907a 76%,#141d18);box-shadow:-10px 12px 34px #0006}
.panel{align-self:center;padding:clamp(1.5rem,5vw,4rem)}h1{font-size:clamp(2rem,4vw,3rem);letter-spacing:-.06em;line-height:1.04;margin:0 0 .75rem}p{color:#c1cac3;margin:0 0 2rem}
label{display:block;margin:1rem 0 .4rem;font-weight:650}input,button{width:100%;min-height:48px;font:inherit}input{border:1px solid #89948d;border-radius:8px;background:#1c211e;color:white;padding:0 .8rem}button{margin-top:1.6rem;border:0;border-radius:999px;background:#1ed760;color:#07130a;font-weight:750;cursor:pointer}button:hover{background:#48e37e}:focus-visible{outline:3px solid white;outline-offset:3px}.error{margin:1rem 0 0;color:#ffb5ad}
@media(max-width:640px){main{grid-template-columns:1fr}.sleeve{min-height:132px;padding:1.35rem}.record{width:230px;left:auto;right:-32px;bottom:-120px}.panel{padding:1.6rem 1.4rem 2rem}}
</style></head><body><main><div class="sleeve"><span class="brand">senandung.</span><div class="record" aria-hidden="true"></div></div>
<section class="panel"><h1>Masuk ke Senandung</h1><p>Buka koleksi dan playlist pribadimu.</p>
<form method="post"><label for="user">Nama pengguna</label><input id="user" name="username" required maxlength="100" autocomplete="username" autocapitalize="none" spellcheck="false">
<label for="pass">Kata sandi</label><input type="password" id="pass" name="password" required maxlength="256" autocomplete="current-password">
${invalid ? '<p class="error" role="alert">Nama pengguna atau kata sandi salah. Coba lagi.</p>' : ""}
<button type="submit">Masuk</button></form></section></main></body></html>`;
}
