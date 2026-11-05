(()=>{'use strict';
const AUTH_KEY='leckekucko_auth_v1';
const AUTH_HASH='7a5f3a3717c8ef1c28345a1fb35ca6a82738f9184ed54243e65ea728e716b2de';
const MAX_AGE=12*60*60*1000;
const now=()=>Date.now();
function valid(){try{const v=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');return !!(v&&v.ok===true&&Number(v.until)>now())}catch{return false}}
function unlock(){document.documentElement.classList.remove('auth-locked');const gate=document.getElementById('leckekucko-auth');if(gate)gate.remove();addLogout()}
function addLogout(){if(document.getElementById('lk-logout'))return;const b=document.createElement('button');b.id='lk-logout';b.type='button';b.textContent='🔒 Kilépés';b.title='LeckeKuckó zárolása';b.onclick=()=>{localStorage.removeItem(AUTH_KEY);location.reload()};document.body.appendChild(b)}
async function sha256(text){const bytes=new TextEncoder().encode(text);const buf=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function gate(){const wrap=document.createElement('div');wrap.id='leckekucko-auth';wrap.innerHTML=`
<div class="lk-auth-card">
  <div class="lk-auth-burst">CSAK NEKED! ✨</div>
  <h1>LeckeKuckó</h1>
  <p>Ez a tanulósarok privát használatra készült. A belépéshez add meg a jelszót.</p>
  <form id="lk-auth-form">
    <div class="lk-auth-field">
      <label for="lk-auth-pass">Jelszó</label>
      <input id="lk-auth-pass" type="password" autocomplete="current-password" inputmode="text" required autofocus>
    </div>
    <button class="lk-auth-btn" type="submit">Belépés →</button>
    <p class="lk-auth-error" id="lk-auth-error" role="alert" aria-live="polite"></p>
  </form>
  <p class="lk-auth-note">A belépés ezen az eszközön 12 óráig marad érvényben.</p>
</div>`;
document.body.appendChild(wrap);
let attempts=0,lockUntil=0;
const form=wrap.querySelector('#lk-auth-form'),input=wrap.querySelector('#lk-auth-pass'),err=wrap.querySelector('#lk-auth-error');
form.addEventListener('submit',async e=>{e.preventDefault();if(now()<lockUntil){err.textContent='Túl sok próbálkozás. Próbáld újra fél perc múlva.';return}
const h=await sha256(input.value);
if(h===AUTH_HASH){localStorage.setItem(AUTH_KEY,JSON.stringify({ok:true,until:now()+MAX_AGE}));unlock();return}
attempts++;input.value='';err.textContent='Nem megfelelő jelszó.';input.focus();
if(attempts>=5){lockUntil=now()+30000;attempts=0;err.textContent='Túl sok próbálkozás. 30 másodperces zárolás.'}
})}
function start(){if(valid())unlock();else gate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();