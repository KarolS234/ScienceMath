const variable = (label, symbol, unit, rules = {}) => ({ label, symbol, unit, ...rules });
const pos = { min: 0, exclusive: true };
const nonneg = { min: 0 };
const m = variable('Masa','m','kg',pos), m1 = variable('Masa del cuerpo 1','m₁','kg',pos), m2 = variable('Masa del cuerpo 2','m₂','kg',pos);
const v = variable('Velocidad','v','m/s'), v0 = variable('Velocidad inicial','v₀','m/s'), vf = variable('Velocidad final','vꜰ','m/s');
const v1 = variable('Velocidad inicial del cuerpo 1','v₁','m/s'), v2 = variable('Velocidad inicial del cuerpo 2','v₂','m/s');
const v1f = variable('Velocidad final del cuerpo 1','v₁′','m/s'), v2f = variable('Velocidad final del cuerpo 2','v₂′','m/s');
const vy = variable('Velocidad vertical inicial','v₀ᵧ','m/s',nonneg), vx = variable('Velocidad horizontal inicial','v₀ₓ','m/s');
const speed = variable('Rapidez inicial','v₀','m/s',nonneg), theta = variable('Ángulo sobre la horizontal','θ','°',{min:0,max:90});
const g = variable('Magnitud de la gravedad','g','m/s²',{...pos,value:'9.81'});
const t = variable('Tiempo transcurrido','t','s',nonneg), a = variable('Aceleración','a','m/s²'), d = variable('Desplazamiento','d','m'), dist = variable('Distancia','d','m',nonneg);
const dy = variable('Desplazamiento vertical','Δy','m'), drop = variable('Distancia de caída','h','m',nonneg);
const F = variable('Fuerza','F','N'), W = variable('Peso','W','N',nonneg), T = variable('Trabajo','T','J'), P = variable('Potencia','P','W');
const Ec = variable('Energía cinética','E꜀','J',nonneg), Ep = variable('Energía potencial','Eₚ','J'), h = variable('Altura respecto a la referencia','h','m');
const w0 = variable('Velocidad angular inicial','ω₀','rad/s'), wf = variable('Velocidad angular final','ωꜰ','rad/s'), alpha = variable('Aceleración angular','α','rad/s²');
const ang = variable('Desplazamiento angular','θ','rad'), turns = variable('Número de ciclos','N','ciclos',nonneg), hz = variable('Frecuencia','f','Hz',nonneg), period = variable('Periodo','T','s',pos);
const X = variable('Suma de componentes en X','ΣVₓ',''), Y = variable('Suma de componentes en Y','ΣVᵧ','');
const V = variable('Magnitud del vector','V','',nonneg), angle = variable('Ángulo desde el eje X','θ','°');
const J = variable('Impulso','J','N·s'), M = variable('Masa total','M','kg',pos);
const verticalAngle = variable('Ángulo medido desde el eje +Y hacia +X','θ','°');
const cvx = variable('Componente final en X','vꜰₓ','m/s'), cvy = variable('Componente final en Y','vꜰᵧ','m/s');
const L = variable('Longitud del lado','L','m',nonneg), C = variable('Temperatura','°C','°C',{min:-273.15}), K = variable('Temperatura','K','K',nonneg), Fahrenheit = variable('Temperatura','°F','°F',{min:-459.67});
const coeff1 = variable('Primer coeficiente','a',''), coeff2 = variable('Segundo coeficiente','b',''), exp1 = variable('Primer exponente','m','',{integer:true,min:-300,max:300}), exp2 = variable('Segundo exponente','n','',{integer:true,min:-300,max:300});
const fromRest = 'Parte del reposo.';
const sameLevel = 'Sin resistencia del aire. El punto de llegada está a la misma altura que el lanzamiento.';
const rad = deg => (deg % 360) * Math.PI / 180;
const sin = deg => deg % 180 === 0 ? 0 : Math.sin(rad(deg));
const cos = deg => Math.abs(deg % 180) === 90 ? 0 : Math.cos(rad(deg));
const div = (x,y) => { if (y === 0) throw Error('El denominador no puede ser cero. Revisa los datos.'); return x/y; };
const root = x => { if (x < 0) throw Error('Con estos datos la raíz no tiene un resultado real.'); return Math.sqrt(x); };
const f = (name, equation, unit, fields, compute, note = '', options = {}) => ({name,equation,unit,fields,compute,note,...options});
const group = (id, name, glyph, description, formulas) => ({id,name,glyph,description,formulas});
const dimensional = (name, equation, unit) => f(name,equation,unit,[],null,'M = masa · L = longitud · T = tiempo.');
const sci = (name, mark, op) => f(name,`R = (a × 10ᵐ) ${mark} (b × 10ⁿ)`,'',[coeff1,exp1,coeff2,exp2],(a,m,b,n)=>{
  if (mark === '÷' && b === 0) return div(a,b);
  // Normalize before operating so large powers can cancel without overflow.
  const normalize = (c,e) => {
    if (!c) return [0,0];
    const [s,p] = c.toExponential().split('e').map(Number);
    return [s,e+p];
  };
  const [x,i] = normalize(a,m), [y,j] = normalize(b,n);
  const k = Math.max(x ? i : -Infinity,y ? j : -Infinity, -1000);
  const [c,e] = mark === '×' ? normalize(x*y,i+j) : mark === '÷' ? normalize(x/y,i-j)
    : normalize(op(x ? x*10**(i-k) : 0,y ? y*10**(j-k) : 0),k);
  return [c,e];
},'Los exponentes deben ser enteros. El resultado se expresa en notación científica.',{scientific:true});

export const topics = [
group('parabolico','Tiro parabólico','arc','Componentes, altura y alcance.',[
 f('Velocidad vertical inicial','v₀ᵧ = v₀ · sen(θ)','m/s',[speed,theta],(v,q)=>v*sin(q),'Ángulo medido en grados sobre la horizontal.'),
 f('Velocidad horizontal inicial','v₀ₓ = v₀ · cos(θ)','m/s',[speed,theta],(v,q)=>v*cos(q),'Ángulo medido en grados sobre la horizontal.'),
 f('Altura máxima','hₘₐₓ = v₀ᵧ² / (2g)','m',[vy,g],(v,g)=>v*v/(2*g),'Altura por encima del punto de lanzamiento.'),
 f('Distancia horizontal','dₕ = v₀ₓ · t','m',[{...vx,...nonneg},t],(v,t)=>v*t),
 f('Alcance horizontal','R = v₀² · sen(2θ) / g','m',[speed,theta,g],(v,q,g)=>v*v*sin(2*q)/g,sameLevel),
 f('Tiempo de subida','tₛ = v₀ᵧ / g','s',[vy,g],(v,g)=>v/g),
 f('Tiempo en el aire','t = 2v₀ᵧ / g','s',[vy,g],(v,g)=>2*v/g,sameLevel),
 f('Tiempo en el aire a partir de la subida','t = 2tₛ','s',[variable('Tiempo de subida','tₛ','s',nonneg)],t=>2*t,sameLevel),
 f('Velocidad vertical en un instante','vᵧ = v₀ᵧ − gt','m/s',[vy,g,t],(v,g,t)=>v-g*t,'Un resultado negativo indica que el objeto está descendiendo.')
]),
group('mru','Movimiento rectilíneo uniforme','line','Distancia, velocidad y tiempo.',[
 f('Rapidez constante','v = d / t','m/s',[dist,t],div),
 f('Distancia recorrida','d = v · t','m',[variable('Rapidez','v','m/s',nonneg),t],(v,t)=>v*t),
 f('Tiempo de recorrido','t = d / v','s',[dist,variable('Rapidez','v','m/s',nonneg)],div)
]),
group('mrua','Movimiento rectilíneo acelerado','trend','Movimiento con aceleración constante.',[
 f('Aceleración a partir del reposo','a = vꜰ / t','m/s²',[vf,t],div,fromRest),
 f('Aceleración con dos velocidades','a = (vꜰ − v₀) / t','m/s²',[vf,v0,t],(v,u,t)=>div(v-u,t)),
 f('Tiempo a partir de la aceleración','t = (vꜰ − v₀) / a','s',[vf,v0,a],(v,u,a)=>div(v-u,a)),
 f('Velocidad final con tiempo','vꜰ = v₀ + at','m/s',[v0,a,t],(v,a,t)=>v+a*t),
 f('Desplazamiento con tiempo y aceleración','d = v₀t + at² / 2','m',[v0,t,a],(v,t,a)=>v*t+a*t*t/2),
 f('Desplazamiento con velocidades y aceleración','d = (vꜰ² − v₀²) / (2a)','m',[vf,v0,a],(v,u,a)=>div(v*v-u*u,2*a)),
 f('Desplazamiento con velocidad media','d = (vꜰ + v₀)t / 2','m',[vf,v0,t],(v,u,t)=>(v+u)*t/2),
 f('Rapidez final con desplazamiento','|vꜰ| = √(v₀² + 2ad)','m/s',[v0,a,d],(v,a,d)=>root(v*v+2*a*d),'La raíz da la magnitud; el sentido depende del movimiento.'),
 f('Velocidad final desde reposo','vꜰ = at','m/s',[a,t],(a,t)=>a*t,fromRest),
 f('Rapidez final desde reposo con desplazamiento','|vꜰ| = √(2ad)','m/s',[a,d],(a,d)=>root(2*a*d),fromRest)
]),
group('caida','Caída libre y tiro vertical','down','Gravedad y desplazamiento vertical.',[
 f('Desplazamiento vertical con tiempo','Δy = v₀t − gt² / 2','m',[v0,t,g],(v,t,g)=>v*t-g*t*t/2,'El eje positivo apunta hacia arriba.'),
 f('Desplazamiento vertical con velocidades','Δy = (v₀² − vꜰ²) / (2g)','m',[v0,vf,g],(u,v,g)=>(u*u-v*v)/(2*g)),
 f('Desplazamiento vertical con velocidad media','Δy = (vꜰ + v₀)t / 2','m',[vf,v0,t],(v,u,t)=>(v+u)*t/2),
 f('Velocidad final con tiempo','vꜰ = v₀ − gt','m/s',[v0,g,t],(v,g,t)=>v-g*t),
 f('Velocidad final desde reposo','vꜰ = −gt','m/s',[g,t],(g,t)=>-g*t,fromRest),
 f('Rapidez final con desplazamiento','|vꜰ| = √(v₀² − 2gΔy)','m/s',[v0,g,dy],(v,g,y)=>root(v*v-2*g*y),'Δy es negativo cuando el punto final está más abajo.'),
 f('Rapidez final desde reposo','|vꜰ| = √(2gh)','m/s',[g,drop],(g,h)=>root(2*g*h),fromRest),
 f('Tiempo de caída desde reposo','t = √(2h / g)','s',[drop,g],(h,g)=>root(2*h/g),fromRest),
 f('Altura máxima','hₘₐₓ = v₀ᵧ² / (2g)','m',[vy,g],(v,g)=>v*v/(2*g),'Altura por encima del punto de lanzamiento.'),
 f('Tiempo de subida','tₛ = v₀ᵧ / g','s',[vy,g],(v,g)=>v/g),
 f('Tiempo en el aire','t = 2v₀ᵧ / g','s',[vy,g],(v,g)=>2*v/g,sameLevel),
 f('Tiempo en el aire a partir de la subida','t = 2tₛ','s',[variable('Tiempo de subida','tₛ','s',nonneg)],t=>2*t,sameLevel)
]),
group('circular','Movimiento circular','orbit','Frecuencia, periodo y rotación.',[
 f('Frecuencia','f = N / t','Hz',[turns,t],div),
 f('Periodo','T = t / N','s',[t,turns],div),
 f('Velocidad angular media','ω = θ / t','rad/s',[ang,t],div),
 f('Velocidad angular con periodo','ω = 2π / T','rad/s',[period],t=>2*Math.PI/t),
 f('Velocidad angular con frecuencia','ω = 2πf','rad/s',[hz],f=>2*Math.PI*f),
 f('Desplazamiento con velocidad constante','θ = ω₀t','rad',[w0,t],(w,t)=>w*t),
 f('Desplazamiento con aceleración angular','θ = (ωꜰ² − ω₀²) / (2α)','rad',[wf,w0,alpha],(v,u,a)=>div(v*v-u*u,2*a)),
 f('Desplazamiento con velocidad angular media','θ = (ωꜰ + ω₀)t / 2','rad',[wf,w0,t],(v,u,t)=>(v+u)*t/2),
 f('Velocidad angular final con tiempo','ωꜰ = ω₀ + αt','rad/s',[w0,alpha,t],(w,a,t)=>w+a*t),
 f('Rapidez angular final con desplazamiento','|ωꜰ| = √(ω₀² + 2αθ)','rad/s',[w0,alpha,ang],(w,a,q)=>root(w*w+2*a*q)),
 f('Grados a radianes','θᵣₐd = θ° · π / 180','rad',[angle],q=>q*Math.PI/180),
 f('Radianes a grados','θ° = θᵣₐd · 180 / π','°',[ang],q=>q*180/Math.PI)
]),
group('newton','Segunda ley de Newton','force','Fuerza neta, masa y peso.',[
 f('Aceleración','a = F / m','m/s²',[{...F,label:'Fuerza neta'},m],div),
 f('Fuerza neta','F = m · a','N',[m,a],(m,a)=>m*a),
 f('Masa','m = F / a','kg',[{...F,label:'Fuerza neta'},a],div),
 f('Peso','P = m · g','N',[m,g],(m,g)=>m*g)
]),
group('estatica','Estática y primera ley','balance','Equilibrio y plano inclinado.',[
 f('Peso','W = m · g','N',[m,g],(m,g)=>m*g),
 f('Condición de equilibrio','ΣFₓ = 0 y ΣFᵧ = 0','',[variable('Fuerza neta en X','ΣFₓ','N'),variable('Fuerza neta en Y','ΣFᵧ','N')],(x,y)=>x===0&&y===0?'En equilibrio traslacional':'No está en equilibrio traslacional','Ingresa las sumas de las fuerzas. Para cuerpos rígidos, el equilibrio estático también requiere momento neto cero.'),
 f('Peso paralelo al plano','Wₓ = W · sen(θ)','N',[W,{...theta,label:'Inclinación del plano'}],(w,q)=>w*sin(q),'Magnitud de la componente dirigida cuesta abajo.'),
 f('Peso perpendicular al plano','Wᵧ = W · cos(θ)','N',[W,{...theta,label:'Inclinación del plano'}],(w,q)=>w*cos(q),'Magnitud de la componente dirigida hacia el plano.')
]),
group('energia','Trabajo y energía','bolt','Trabajo, energía cinética y potencial.',[
 f('Trabajo mecánico','T = F · d','J',[{...F,label:'Componente de la fuerza en la dirección del desplazamiento'},dist],(f,d)=>f*d,'Para fuerza constante.'),
 f('Energía cinética','E꜀ = mv² / 2','J',[m,v],(m,v)=>m*v*v/2),
 f('Masa a partir de energía cinética','m = 2E꜀ / v²','kg',[Ec,v],(e,v)=>div(2*e,v*v)),
 f('Energía potencial gravitatoria','Eₚ = mgh','J',[m,g,h],(m,g,h)=>m*g*h),
 f('Altura a partir de energía potencial','h = Eₚ / (mg)','m',[Ep,m,g],(e,m,g)=>e/(m*g))
]),
group('potencia','Potencia mecánica','gauge','Trabajo por tiempo o fuerza por velocidad.',[
 f('Potencia media','P = T / t','W',[T,t],div),
 f('Tiempo a partir de la potencia','t = T / P','s',[T,P],div),
 f('Potencia a partir de fuerza y velocidad','P = F · v','W',[F,v],(f,v)=>f*v,'Fuerza y velocidad en el mismo eje.'),
 f('Velocidad a partir de la potencia','v = P / F','m/s',[P,F],div,'Fuerza y velocidad en el mismo eje.')
]),
group('impulso','Impulso y cantidad de movimiento','impact','Fuerza media y cambio de velocidad.',[
 f('Impulso con fuerza y tiempo','i = F · t','N·s',[{...F,label:'Fuerza media'},t],(f,t)=>f*t),
 f('Cantidad de movimiento','p = m · v','kg·m/s',[m,v],(m,v)=>m*v,'Para una sola componente del movimiento.'),
 f('Impulso desde reposo','i = m · vꜰ','N·s',[m,vf],(m,v)=>m*v,fromRest),
 f('Fuerza media desde reposo','F = mvꜰ / t','N',[m,vf,t],(m,v,t)=>div(m*v,t),fromRest),
 f('Fuerza media con cambio de velocidad','F = m(vꜰ − v₀) / t','N',[m,vf,v0,t],(m,v,u,t)=>div(m*(v-u),t)),
 f('Tiempo a partir de la fuerza media','t = m(vꜰ − v₀) / F','s',[m,vf,v0,{...F,label:'Fuerza media'}],(m,v,u,f)=>div(m*(v-u),f))
]),
group('choques','Colisiones','impact','Conservación del momento e impulso.',[
 f('Velocidad final del cuerpo 1','v₁′ = (m₁v₁ + m₂v₂ − m₂v₂′) / m₁','m/s',[m1,v1,m2,v2,v2f],(a,u,b,v,w)=>(a*u+b*v-b*w)/a,'Conservación de la cantidad de movimiento en un eje.'),
 f('Velocidad final del cuerpo 2','v₂′ = (m₁v₁ + m₂v₂ − m₁v₁′) / m₂','m/s',[m1,v1,m2,v2,v1f],(a,u,b,v,w)=>(a*u+b*v-a*w)/b,'Conservación de la cantidad de movimiento en un eje.'),
 f('Velocidad final común','vꜰ = (m₁v₁ + m₂v₂) / (m₁ + m₂)','m/s',[m1,v1,m2,v2],(a,u,b,v)=>(a*u+b*v)/(a+b),'Los cuerpos quedan unidos tras el choque.'),
 f('Velocidad inicial del cuerpo 1 con momento total cero','v₁ = −m₂v₂ / m₁','m/s',[m2,v2,m1],(b,v,a)=>-b*v/a,'El momento total en este eje es cero.'),
 f('Impulso','J = m(vꜰ − v₀)','N·s',[m,vf,v0],(m,v,u)=>m*(v-u)),
 f('Fuerza media','F = J / t','N',[J,t],div),
 f('Masa total','M = m₁ + m₂','kg',[m1,m2],(a,b)=>a+b),
 f('Componente final en X','vꜰₓ = vꜰ · sen(θ)','m/s',[{...vf,label:'Rapidez final',...nonneg},verticalAngle],(v,q)=>v*sin(q),'Aquí θ se mide desde el eje vertical positivo, como indican las componentes de la hoja.'),
 f('Componente final en Y','vꜰᵧ = vꜰ · cos(θ)','m/s',[{...vf,label:'Rapidez final',...nonneg},verticalAngle],(v,q)=>v*cos(q),'Aquí θ se mide desde el eje vertical positivo.'),
 f('Velocidad inicial del cuerpo 1 sobre X','v₁ = Mvꜰₓ / m₁','m/s',[M,cvx,m1],(m,v,a)=>m*v/a,'Los cuerpos llegan en ejes perpendiculares y quedan unidos.'),
 f('Velocidad inicial del cuerpo 2 sobre Y','v₂ = Mvꜰᵧ / m₂','m/s',[M,cvy,m2],(m,v,a)=>m*v/a,'Los cuerpos llegan en ejes perpendiculares y quedan unidos.')
]),
group('vectores','Vectores y trigonometría','vector','Componentes, magnitud y dirección.',[
 f('Distancia total','dₜ = d₁ + d₂ + d₃ + …','m',[variable('Distancia del tramo 1','d₁','m',nonneg)],(...ds)=>ds.reduce((a,b)=>a+b,0),'Agrega un campo por cada tramo.',{repeat:true}),
 f('Componente en X','Vₓ = V · cos(θ)','',[V,angle],(v,q)=>v*cos(q),'El resultado conserva la unidad del vector original.'),
 f('Componente en Y','Vᵧ = V · sen(θ)','',[V,angle],(v,q)=>v*sin(q),'El resultado conserva la unidad del vector original.'),
 f('Magnitud resultante','R = √((ΣVₓ)² + (ΣVᵧ)²)','',[X,Y],Math.hypot,'Usa la misma unidad en ambas componentes.'),
 f('Ángulo de la resultante','θ = atan2(ΣVᵧ, ΣVₓ)','°',[X,Y],(x,y)=>{
   if (!x && !y) throw Error('Un vector de magnitud cero no tiene dirección.');
   return Math.atan2(y,x)*180/Math.PI;
 },'Medido desde +X; se respeta el cuadrante.')
]),
group('unidades','Área y volumen','box','Dimensiones a partir de un lado.',[
 f('Volumen de un cubo','V = L³','m³',[L],l=>l**3),
 f('Área de un cuadrado','A = L²','m²',[L],l=>l**2)
]),
group('temperatura','Conversión de temperaturas','temp','Celsius, Fahrenheit y Kelvin.',[
 f('Celsius a Kelvin','K = °C + 273.15','K',[C],c=>c+273.15),
 f('Kelvin a Celsius','°C = K − 273.15','°C',[K],k=>k-273.15),
 f('Celsius a Fahrenheit','°F = 1.8 · °C + 32','°F',[C],c=>1.8*c+32),
 f('Fahrenheit a Celsius','°C = (°F − 32) · 5 / 9','°C',[Fahrenheit],f=>(f-32)*5/9)
]),
group('cientifica','Notación científica','power','Operaciones con potencias de diez.',[
 sci('Suma','+',(a,b)=>a+b), sci('Resta','−',(a,b)=>a-b), sci('Multiplicación','×'), sci('División','÷')
]),
group('dimensional','Análisis dimensional','grid','Consulta dimensiones y unidades del SI.',[
 dimensional('Rapidez o velocidad','[v] = L · T⁻¹','m/s'),
 dimensional('Aceleración','[a] = L · T⁻²','m/s²'),
 dimensional('Área','[A] = L²','m²'),
 dimensional('Densidad','[ρ] = M · L⁻³','kg/m³'),
 dimensional('Fuerza','[F] = M · L · T⁻²','N'),
 dimensional('Trabajo o energía','[E] = M · L² · T⁻²','J'),
 dimensional('Presión','[P] = M · L⁻¹ · T⁻²','Pa')
])
];

export function parseValue(raw, field) {
 const value = raw.trim().replace('−','-').replace(',','.');
 const n = Number(value);
 if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) || !Number.isFinite(n))
   throw Error(raw.trim() ? 'Ingresa un número válido.' : 'Ingresa un valor.');
 if (field.min !== undefined && (field.exclusive ? n <= field.min : n < field.min))
   throw Error(`Usa un valor ${field.exclusive ? 'mayor' : 'mayor o igual'} a ${field.min}.`);
 if (field.max !== undefined && n > field.max) throw Error(`Usa un valor menor o igual a ${field.max}.`);
 if (field.integer && !Number.isInteger(n)) throw Error('Ingresa un número entero.');
 return n;
}

export function evaluate(formula, values) {
 const value = formula.compute(...values);
 if (typeof value === 'number' && (!Number.isFinite(value) || (formula.unit === 's' && value < 0))) {
   throw Error(Number.isFinite(value) ? 'El tiempo resultó negativo. Revisa los datos y sus signos.' : 'El resultado excede el rango numérico.');
 }
 return value;
}
