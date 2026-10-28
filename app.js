'use strict';
const $=id=>document.getElementById(id),nf=new Intl.NumberFormat('ru-RU');
const kinds={games:'Игры',target:'Целевой контент',quests:'Квесты и материалы',tasks:'Задания',upgrades:'Улучшения аптеки',pets:'Предметы для кота',stock:'Склад',city:'Город и аптеки',estate:'Объявления о недвижимости',staff:'Персонал',factory:'Завод',services:'Услуги и ускорения',daily:'Игра дня',features:'Игровые механики'};
const statuses={available:'Подключено',task:'Из заданий',project:'Есть в проекте',server:'Серверный каталог',review:'Проверить запуск'};
const emojis={games:'🎮',target:'◆',quests:'📚',tasks:'✓',upgrades:'✚',pets:'🐾',stock:'💊',city:'🏪',estate:'🏘',staff:'👤',factory:'⚙',services:'⏱',daily:'☀',features:'✦'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);
const state={section:params.get('section')||'all',search:params.get('q')||'',currency:params.get('currency')||'all',direction:params.get('direction')||'all',platform:params.get('platform')||'all',status:params.get('status')||'all',limit:48,view:'cards'};
let data,filtered=[];
const sectionMatches=(item,section)=>section==='all'||section==='purchases'&&item.direction==='spend'||section==='learning'&&['target','quests'].includes(item.kind)||item.kind===section;
function card(item){
 const currency=item.currency,variable=item.amount==null;
 let amount=currency==='none'?'Без отдельной цены':variable?(item.direction==='earn'?'По результату':'По условиям'):((item.basePrice?'от ':'')+(item.direction==='earn'?'+':'')+nf.format(item.amount)+' '+(currency==='coins'?'монет':'кристаллов'));
 if(item.baseReward)amount+=' *';
 const badges=[...(item.tags||[])];if(item.platforms.length===1&&item.platforms[0]==='mobile'&&!badges.includes('Только телефон'))badges.push('Только телефон');
 return `<article class="card" data-key="${esc(item.key)}"><div class="card-top"><span class="kind-label">${esc(kinds[item.kind])}</span><span class="status ${esc(item.status)}">${esc(statuses[item.status])}</span></div><div class="card-content"><div class="card-art ${item.key==='game-marble'?'marble':''}">${item.image?`<img src="${esc(item.image)}" alt="${esc(item.key==='game-marble'?'Схема первого уровня':item.title)}" loading="lazy" width="74" height="74">`:`<span class="fallback" aria-hidden="true">${emojis[item.kind]}</span>`}</div><h3>${esc(item.title)}</h3><p class="card-description">${esc(item.description)}</p>${badges.length?`<div class="card-tags">${badges.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</div><div class="card-money"><span>${item.direction==='earn'?'Награда':item.direction==='spend'?'Покупка / расход':'Механика'}</span><b class="amount ${esc(currency)}">${esc(amount)}</b></div><details><summary>Условия и источник</summary><p>${esc(item.description)}</p><p>${esc(item.notes||'Наличие подтверждено в исходниках текущего проекта.')}</p>${item.themes?`<p><b>Локации:</b> ${item.themes.map(x=>esc(x.name)).join(' · ')}</p>`:''}${item.legacyCoins!==undefined?`<p>Исходный номинал в API: ${nf.format(item.legacyCoins)} монет${item.target?'; текущая награда DEV — кристаллы, эти суммы не складываются.':'.'}</p>`:''}${item.originalTitle&&item.originalTitle!==item.title?`<p>Исходное имя в справочнике: ${esc(item.originalTitle)}</p>`:''}${item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Адрес материала ↗</a>`:''}<p class="source">${esc(item.source)}<br>Ключ аудита: ${esc(item.key)}</p></details></article>`;
}
function syncUrl(){const p=new URLSearchParams();if(state.section!=='all')p.set('section',state.section);if(state.search)p.set('q',state.search);for(const key of ['currency','direction','platform','status'])if(state[key]!=='all')p.set(key,state[key]);history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():''));}
function render(){
 const q=state.search.toLocaleLowerCase('ru').trim();
 filtered=data.items.filter(x=>sectionMatches(x,state.section)&&(state.currency==='all'||x.currency===state.currency)&&(state.direction==='all'||x.direction===state.direction)&&(state.status==='all'||x.status===state.status)&&(state.platform==='all'||state.platform==='mobile-only'&&x.platforms.length===1&&x.platforms[0]==='mobile'||x.platforms.includes(state.platform))&&(!q||[x.title,x.description,x.notes,x.source,x.key,...(x.tags||[])].join(' ').toLocaleLowerCase('ru').includes(q)));
 $('cards').hidden=state.view!=='cards';$('table-wrap').hidden=state.view!=='table';
 $('cards').innerHTML=state.view==='cards'?filtered.slice(0,state.limit).map(card).join(''):'';
 $('table-body').innerHTML=state.view==='table'?filtered.map(x=>`<tr data-key="${esc(x.key)}"><td><b>${esc(x.title)}</b></td><td>${esc(kinds[x.kind])}</td><td>${x.platforms.length===1?'Только телефон':'ПК и телефон'}</td><td>${x.direction==='earn'?'Награда':x.direction==='spend'?'Расход':'Механика'}</td><td>${x.currency==='none'?'—':x.amount==null?'По условиям':(x.basePrice?'от ':'')+(x.direction==='earn'?'+':'')+nf.format(x.amount)+' '+(x.currency==='coins'?'монет':'кристаллов')}</td><td>${esc(statuses[x.status])}</td><td>${esc(x.notes)}</td></tr>`).join(''):'';
 $('view-cards').setAttribute('aria-pressed',String(state.view==='cards'));$('view-table').setAttribute('aria-pressed',String(state.view==='table'));$('results-count').textContent=`Найдено ${nf.format(filtered.length)} из ${nf.format(data.items.length)} позиций · показано ${(state.view==='table'?filtered.length:Math.min(state.limit,filtered.length))}`;$('empty').hidden=filtered.length!==0;$('more').hidden=state.view==='table'||filtered.length<=state.limit;
 $('tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.section===state.section)));syncUrl();
}
async function init(){
 const response=await fetch('data.json');if(!response.ok)throw Error('Не удалось загрузить каталог');data=await response.json();
 const games=data.items.filter(x=>x.kind==='games').length,learning=data.items.filter(x=>['target','quests'].includes(x.kind)).length;
 $('stats').innerHTML=[[games,'игровых вариантов, включая мобильный лабиринт'],[learning,'квестов и материалов в справочнике'],[8,'из них — целевые материалы за кристаллы'],[data.items.length,'позиций в полном реестре аудита']].map(([n,title])=>`<div class="stat"><strong>${nf.format(n)}</strong><span>${esc(title)}</span></div>`).join('');
 const tabs=[['all','Весь аудит'],['games','Игры'],['target','Целевой контент'],['learning','Квесты и материалы'],['tasks','Задания'],['purchases','Покупки'],['features','Механики']];
 $('tabs').innerHTML=tabs.map(([key,title])=>`<button class="tab" data-section="${key}" aria-pressed="false">${title}<span>${data.items.filter(x=>sectionMatches(x,key)).length}</span></button>`).join('');
 if(!tabs.some(x=>x[0]===state.section))state.section='all';
 $('tabs').onclick=e=>{const button=e.target.closest('button[data-section]');if(!button)return;state.section=button.dataset.section;state.limit=48;render();};
 for(const key of ['currency','direction','platform','status']){$(key).value=state[key];if(!$(key).value){state[key]='all';$(key).value='all';}$(key).onchange=()=>{state[key]=$(key).value;state.limit=48;render();};}
 $('search').value=state.search;$('search').oninput=()=>{state.search=$('search').value;state.limit=48;render();};
 $('reset').onclick=()=>{state.section='all';state.search='';$('search').value='';for(const k of ['currency','direction','platform','status']){state[k]='all';$(k).value='all';}state.limit=48;render();};
 for(const view of ['cards','table'])$('view-'+view).onclick=()=>{state.view=view;render();};
 $('more').onclick=()=>{state.limit+=48;render();};
 $('show-marble').onclick=()=>{state.section='games';state.search='Наклонный лабиринт';$('search').value=state.search;for(const k of ['currency','direction','platform','status']){state[k]='all';$(k).value='all';}render();$('catalog').scrollIntoView({block:'start'});$('search').focus({preventScroll:true});};
 $('findings-count').textContent=`${data.findings.length} наблюдений · раскрыть`;
 $('findings').innerHTML=data.findings.map(x=>`<article class="finding ${esc(x.level)}"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('');
 $('scope').textContent=data.meta.scope;$('source-summary').textContent=`Срез ${data.meta.snapshotMoscow}. ${data.meta.source}. В реестре: 23 игровых варианта, 27 квестов и материалов, 20 заданий и 24 улучшения. Разные платформенные варианты и библиотечные игры учтены отдельно.`;
 $('updated').textContent='Обновлено: '+data.meta.snapshotMoscow;
 render();window.__catalogReady=true;
}
init().catch(e=>{$('results-count').textContent=e.message;$('empty').hidden=false;$('empty').textContent='Попробуйте обновить страницу или скачайте полный каталог CSV.';});
