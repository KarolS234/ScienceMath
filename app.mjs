import { topics, parseValue, evaluate } from './formulas.mjs';

const $ = id => document.getElementById(id);
const icons = {
 arc:'M2 17 Q12 -5 22 17 M2 20h20',line:'M3 12h17m-5-5 5 5-5 5',trend:'M3 20 Q13 19 21 3',down:'M12 3v17m-5-5 5 5 5-5',
 orbit:'M22 12c0 3-5 5-10 5s-10-2-10-5 5-5 10-5 10 2 10 5Z M12 10v4',force:'M3 6h11m-8 6h15m-5-5 5 5-5 5M3 18h8',
 balance:'M12 3v17m-7 0h14M3 7h18M5 7l-3 7h6L5 7zm14 0-3 7h6l-3-7z',bolt:'M13 2 4 14h7l-1 8 10-13h-8z',
 gauge:'M3 17a9 9 0 1 1 18 0M12 14l5-5M5 20h14',impact:'M2 12h6m-3-3 3 3-3 3m17-3h-6m3-3-3 3 3 3M12 3v4m0 10v4',
 vector:'M4 3v17h17M5 19 19 5m-6 0h6v6',box:'m12 2 9 5v10l-9 5-9-5V7l9-5zm0 10 9-5m-9 5L3 7m9 5v10',
 temp:'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Zm3-6v9',power:'m3 18 8-8m0 8-8-8m11-4c0-4 7-4 7-1 0 2-7 3-7 6h7',grid:'M3 3h18v18H3zm0 9h18M12 3v18'
};
let topic = topics[0], formula = topic.formulas[0], fields = [];
let activeTopic = null;
const cards = new Map(topics.map(item => {
 const card = document.createElement('a');
 card.className = 'topic-card';
 card.href = '#' + item.id;
 card.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.pushState({fromCatalog:true},'',card.href);
  renderRoute(true);
 });
 card.innerHTML = `<span class="topic-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[item.glyph]}"/></svg></span>`;
 const title = document.createElement('strong'), description = document.createElement('span');
 title.textContent = item.name;
 description.className = 'topic-description';
 description.textContent = item.description;
 card.append(title, description);
 $('topics').append(card);
 return [item.id,card];
}));
$('formula').addEventListener('change', e => selectFormula(Number(e.target.value)));

function renderRoute(moveFocus = false) {
 const item = topics.find(t => '#' + t.id === location.hash);
 const previous = activeTopic;
 activeTopic = item?.id ?? null;
 $('home').hidden = !!item;
 $('workspace').hidden = !item;
 if (item) {
  topic = item;
  $('topic-title').textContent = item.name;
  $('topic-description').textContent = item.description;
  $('formula').replaceChildren(...item.formulas.map((f,i)=>new Option(f.name,i)));
  selectFormula(0);
  document.title = `${item.name} · ScienceMath`;
 } else {
  document.title = 'ScienceMath · Calculadora de física';
 }
 if (moveFocus) {
  const target = item ? $('topic-title') : cards.get(previous) ?? $('home-title');
  if (item || !previous) window.scrollTo(0,0);
  target.focus();
 }
}
$('back').addEventListener('click', event => {
 if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
 event.preventDefault();
 if (history.state?.fromCatalog) { history.back(); return; }
 history.replaceState(null,'',location.pathname + location.search);
 renderRoute(true);
});
window.addEventListener('hashchange',()=>{
 const route = topics.find(t => '#' + t.id === location.hash)?.id ?? null;
 if (route !== activeTopic) renderRoute(true);
});
function selectFormula(index) {
 formula = topic.formulas[index];
 $('equation').textContent = formula.equation;
 $('note').textContent = formula.note;
 resetFields();
}
function resetFields() {
 fields = [];
 $('fields').replaceChildren();
 formula.fields.forEach(addField);
 $('actions').hidden = !formula.compute;
 $('segments').hidden = !formula.repeat;
 $('remove').disabled = true;
 $('add').disabled = false;
 resetResult();
}
function addField(field) {
 const row = document.createElement('div'), box = document.createElement('div'), input = document.createElement('input'), label = document.createElement('label');
 const id = `value-${fields.length+1}`;
 row.className = 'field';
 box.className = 'input-box';
 label.htmlFor = id;
 label.textContent = field.label + ' ';
 if (field.symbol && field.symbol !== field.unit) {
  const symbol = document.createElement('span');
  symbol.className = 'symbol';
  symbol.textContent = `(${field.symbol})`;
  label.append(symbol);
 }
 input.id = id;
 input.type = 'text';
 input.inputMode = field.integer ? 'numeric' : 'decimal';
 input.autocomplete = 'off';
 input.spellcheck = false;
 input.placeholder = '0';
 input.required = true;
 input.value = field.value ?? '';
 box.append(input);
 if (field.unit) {
  const unit = document.createElement('span');
  unit.textContent = field.unit;
  unit.id = id + '-unit';
  input.setAttribute('aria-describedby',unit.id);
  box.classList.add('with-unit');
  box.append(unit);
 }
 row.append(label,box);
 $('fields').append(row);
 fields.push({field,input,row});
 input.addEventListener('input', resetResult);
 return input;
}
function resetResult() {
 $('result').textContent = '—';
 $('unit').textContent = formula.unit;
 $('result-hint').textContent = formula.compute ? 'Ingresa los datos y pulsa Calcular.' : 'Unidad del Sistema Internacional.';
 if (!formula.compute) $('result').textContent = formula.unit;
 if (!formula.compute) $('unit').textContent = '';
 $('error').hidden = true;
 fields.forEach(({input,field})=>{
  input.removeAttribute('aria-invalid');
  if(field.unit) input.setAttribute('aria-describedby',input.id+'-unit');
  else input.removeAttribute('aria-describedby');
 });
}
$('clear').addEventListener('click',()=>{
 fields.forEach(({field,input})=>{input.value=field.value??'';});
 resetResult();
 fields[0]?.input.focus();
});
$('add').addEventListener('click',()=>{
 const index = fields.length + 1;
 if(index > 30) return;
 resetResult();
 $('remove').disabled = false;
 $('add').disabled = index === 30;
 addField({...formula.fields[0],label:`Distancia del tramo ${index}`,symbol:`d${index}`}).focus();
});
$('remove').addEventListener('click',()=>{
 if(fields.length <= 1) return;
 fields.pop().row.remove();
 $('remove').disabled = fields.length === 1;
 $('add').disabled = false;
 resetResult();
 if ($('remove').disabled) $('add').focus();
});
const fmt = new Intl.NumberFormat('es-MX',{maximumSignificantDigits:10,useGrouping:false});
function showScientific(coefficient, exponent){
 if (!coefficient) return '0';
 const rounded = Number(coefficient.toPrecision(10));
 return Math.abs(rounded) === 10
  ? `${rounded / 10} × 10^${exponent + 1}`
  : `${fmt.format(rounded)} × 10^${exponent}`;
}
function showNumber(n){
 if(n !== 0 && (Math.abs(n)<1e-6 || Math.abs(n)>=1e10)){
  const [coefficient, exponent] = n.toExponential(8).split('e').map(Number);
  return `${fmt.format(coefficient)} × 10^${exponent}`;
 }
 return fmt.format(n || 0);
}
$('calculator').addEventListener('submit', e=>{
 e.preventDefault();
 if(!formula.compute) return;
 resetResult();
 let bad;
 try {
  const values = fields.map(({field,input})=>{
   try { return parseValue(input.value,field); }
   catch (error) { bad = input; throw Error(`${field.label}: ${error.message}`); }
  });
  const value = evaluate(formula,values);
  $('result').textContent = Array.isArray(value) ? showScientific(...value)
   : typeof value === 'number' ? showNumber(value) : value;
  $('result-hint').textContent = formula.name;
  const result = $('result').getBoundingClientRect();
  if(result.bottom > window.innerHeight || result.top < 0) {
   $('result-title').scrollIntoView({block:'center'});
  }
 } catch(error) {
  $('error').textContent = error.message;
  $('error').hidden = false;
  if(bad){
   bad.setAttribute('aria-invalid','true');
   bad.setAttribute('aria-describedby', [bad.getAttribute('aria-describedby'), 'error'].filter(Boolean).join(' '));
   bad.focus();
  }
 }
});
renderRoute();

let deferredInstall;
const install = $('install');
const standalone = matchMedia('(display-mode: standalone)');
function checkInstalled(){ install.hidden = standalone.matches || navigator.standalone === true; }
checkInstalled();
standalone.addEventListener('change',checkInstalled);
window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();deferredInstall=e;});
window.addEventListener('appinstalled',()=>{deferredInstall=null;install.hidden=true;});
install.addEventListener('click',async ()=>{
 if(!deferredInstall){$('install-help').showModal();return;}
 const prompt = deferredInstall;
 deferredInstall = null;
 try { await prompt.prompt(); } catch { $('install-help').showModal(); }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
