(function(){
'use strict';
var VC=window.VC||{};
var VALORES=[1000,2000,3000,5000,7500,10000];
var UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
function brl(n){return 'R$ '+n.toLocaleString('pt-BR')}

// Perguntas. Texto vem do brief; a copy final é do Copy Chief.
var P=[
 {k:'apps',t:'Em quais apps tu dirige?',d:'Pode marcar mais de um.',multi:1,o:['Uber','99','inDrive','iFood ou entregas','Outro']},
 {k:'tempo',t:'Há quanto tempo tu dirige por app?',o:['Menos de 6 meses','6 a 12 meses','1 a 2 anos','2 a 5 anos','Mais de 5 anos']},
 {k:'corridas',t:'Quantas corridas tu faz por semana?',o:['Até 50','51 a 100','101 a 200','Mais de 200']},
 {k:'ganho',t:'Quanto tu ganha por semana com os apps, em média?',o:['Até R$ 500','R$ 501 a R$ 1.000','R$ 1.001 a R$ 1.500','R$ 1.501 a R$ 2.500','Mais de R$ 2.500']},
 {k:'nota',t:'Qual é a tua nota no app?',o:['Abaixo de 4,7','4,7 a 4,8','4,81 a 4,9','Acima de 4,9','Não sei']},
 {k:'carro',t:'O carro que tu dirige é:',o:['Próprio quitado','Próprio financiado','Alugado','De outra pessoa']},
 {k:'valor',t:'De quanto tu precisa?',o:VALORES.map(brl),v:VALORES},
 {k:'parcelas',t:'Em quantas vezes tu quer pagar?',o:['3 vezes','6 vezes','10 vezes','12 vezes'],v:[3,6,10,12]},
 {k:'motivo',t:'Pra que é o dinheiro?',o:['Manutenção ou conserto do carro','Trocar ou dar entrada no carro','Pagar dívidas','Contas da casa','Emergência de saúde','Outro']},
 {k:'negativado',t:'Teu nome está negativado hoje?',o:['Sim','Não','Não sei']},
 {k:'conta_app',t:'Tu cadastraria a conta VolanteCred como conta de recebimento no app pra parcela sair sozinha?',o:['Sim','Sim, se a taxa for boa','Não']},
 {k:'local',t:'Em que cidade tu dirige?',form:'local'},
 {k:'contato',t:'Pra fechar, teus dados',d:'É por aqui que a gente te chama quando a análise abrir.',form:'contato'}
];
var R={},i=0,enviando=false,iniciou=false;
var $=function(s){return document.querySelector(s)};
var body=$('#qbody'),prog=$('#prog'),cont=$('#cont'),volta=$('#volta');

// origem: UTMs e fbclid guardados na chegada
var ORIG=(function(){
 var o={},q=new URLSearchParams(location.search);
 ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(function(k){var v=q.get(k);if(v)o[k]=v.slice(0,300)});
 try{var s=sessionStorage.getItem('vc_orig');if(s&&!Object.keys(o).length)o=JSON.parse(s);else sessionStorage.setItem('vc_orig',JSON.stringify(o))}catch(e){}
 o.pagina=location.origin+location.pathname;
 return o;
})();

// pixel Meta
function fb(){if(window.fbq)window.fbq.apply(null,arguments)}
if(VC.pixel){
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fb('init',VC.pixel);fb('track','PageView');
}

// controle de valor da página
var rng=$('#rng'),val=$('#val');
if(rng){rng.addEventListener('input',function(){val.textContent=brl(VALORES[+rng.value])})}

function abrir(){
 if(rng)R.valor=VALORES[+rng.value];
 document.body.classList.add('q');window.scrollTo(0,0);
 if(!iniciou){iniciou=true;fb('track','InitiateCheckout');history.pushState({q:1},'')}
 tela();
}
document.querySelectorAll('[data-quiz]').forEach(function(b){b.addEventListener('click',abrir)});
window.addEventListener('popstate',function(){if(document.body.classList.contains('q')&&!enviando){if(i>0&&i<P.length){i--;history.pushState({q:1},'');tela()}else{document.body.classList.remove('q');iniciou=false}}});
volta.addEventListener('click',function(){if(i>0){i--;tela()}else{history.back()}});

function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}

function tela(){
 var p=P[i];body.innerHTML='';
 prog.style.width=Math.round((i+1)/P.length*100)+'%';
 cont.textContent=(i+1)+'/'+P.length;volta.hidden=false;
 body.appendChild(el('h2','',p.t));
 if(p.d)body.appendChild(el('p','dica',p.d));
 if(p.form==='local')return telaLocal();
 if(p.form==='contato')return telaContato();
 var ops=el('div','ops');
 p.o.forEach(function(txt,n){
  var v=p.v?p.v[n]:txt;
  var b=el('button','op'+(p.multi?' multi':''));b.type='button';
  b.appendChild(el('span','m'));b.appendChild(el('span','',txt));
  var on=p.multi?(R[p.k]||[]).indexOf(v)>-1:R[p.k]===v;
  if(on)b.classList.add('on');
  b.addEventListener('click',function(){
   if(p.multi){
    var a=R[p.k]||[];var x=a.indexOf(v);if(x>-1)a.splice(x,1);else a.push(v);R[p.k]=a;
    b.classList.toggle('on');prox.disabled=!a.length;
   }else{
    R[p.k]=v;ops.querySelectorAll('.op').forEach(function(o){o.classList.remove('on')});b.classList.add('on');
    setTimeout(avanca,180);
   }
  });
  ops.appendChild(b);
 });
 body.appendChild(ops);
 var prox;
 if(p.multi){prox=el('button','btn','Continuar');prox.type='button';prox.disabled=!(R[p.k]||[]).length;prox.addEventListener('click',avanca);body.appendChild(prox)}
}
function avanca(){fb('trackCustom','QuizEtapa',{etapa:i+1,pergunta:P[i].k});i++;window.scrollTo(0,0);tela()}

function campo(id,rot,attrs,erro,opc){
 var c=el('div','campo'),l=el('label');l.htmlFor=id;l.textContent=rot;
 if(opc){l.appendChild(document.createTextNode(' '));l.appendChild(el('small','','(opcional)'))}
 var inp=el(attrs.tag||'input');inp.id=id;
 for(var k in attrs)if(k!=='tag')inp.setAttribute(k,attrs[k]);
 c.appendChild(l);c.appendChild(inp);c.appendChild(el('div','e',erro));
 inp.addEventListener('input',function(){c.classList.remove('err')});
 return {c:c,i:inp};
}

function telaLocal(){
 var cid=campo('f_cidade','Cidade',{type:'text',autocomplete:'address-level2',maxlength:'60'},'Escreve o nome da cidade.');
 var uf=campo('f_uf','Estado',{tag:'select',autocomplete:'address-level1'},'Escolhe o estado.');
 uf.i.appendChild(new Option('Escolhe o estado',''));
 UFS.forEach(function(u){uf.i.appendChild(new Option(u,u))});
 cid.i.value=R.cidade||'';uf.i.value=R.uf||'';
 var b=el('button','btn','Continuar');b.type='button';
 b.addEventListener('click',function(){
  var c=cid.i.value.trim(),ok=true;
  if(c.length<2){cid.c.classList.add('err');ok=false}
  if(!uf.i.value){uf.c.classList.add('err');ok=false}
  if(!ok)return;R.cidade=c;R.uf=uf.i.value;avanca();
 });
 body.appendChild(cid.c);body.appendChild(uf.c);body.appendChild(b);
}

function cpfOk(s){
 s=s.replace(/\D/g,'');if(s.length!==11||/^(\d)\1{10}$/.test(s))return false;
 for(var t=9;t<11;t++){var d=0;for(var c=0;c<t;c++)d+=+s[c]*(t+1-c);d=(d*10)%11%10;if(d!==+s[t])return false}
 return true;
}
function mascCpf(v){v=v.replace(/\D/g,'').slice(0,11);return v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')}
function mascTel(v){v=v.replace(/\D/g,'').slice(0,11);if(v.length<3)return v;if(v.length<8)return '('+v.slice(0,2)+') '+v.slice(2);return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7)}

function telaContato(){
 var nome=campo('f_nome','Nome completo',{type:'text',autocomplete:'name',maxlength:'80'},'Escreve teu nome e sobrenome.');
 var zap=campo('f_zap','WhatsApp com DDD',{type:'tel',inputmode:'numeric',autocomplete:'tel-national',placeholder:'(11) 91234-5678'},'Confere o número com DDD.');
 var mail=campo('f_mail','E-mail',{type:'email',autocomplete:'email',maxlength:'120'},'Confere o e-mail.',true);
 var cpf=campo('f_cpf','CPF',{type:'text',inputmode:'numeric',autocomplete:'off',placeholder:'000.000.000-00'},'CPF inválido. Confere os números.');
 var hp=el('input','hp');hp.type='text';hp.name='site';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
 nome.i.value=R.nome||'';zap.i.value=R.whatsapp?mascTel(R.whatsapp):'';mail.i.value=R.email||'';
 zap.i.addEventListener('input',function(){zap.i.value=mascTel(zap.i.value)});
 cpf.i.addEventListener('input',function(){cpf.i.value=mascCpf(cpf.i.value)});
 var ac=el('label','aceite'),ck=el('input');ck.type='checkbox';ck.id='f_lgpd';
 var tx=el('span');tx.appendChild(document.createTextNode('Autorizo a VolanteCred a usar meus dados para pré-análise de crédito e consulta a birôs de crédito, e a falar comigo pelo WhatsApp. '));
 var a=el('a','','Política de privacidade');a.href='privacidade.html';a.target='_blank';a.rel='noopener';tx.appendChild(a);
 ac.appendChild(ck);ac.appendChild(tx);ck.addEventListener('change',function(){ac.classList.remove('err')});
 var er=el('p','erro');er.hidden=true;
 var b=el('button','btn','Enviar meu pré-cadastro');b.type='button';
 b.addEventListener('click',function(){
  if(enviando)return;
  var ok=true,n=nome.i.value.trim().replace(/\s+/g,' '),z=zap.i.value.replace(/\D/g,''),m=mail.i.value.trim(),c=cpf.i.value.replace(/\D/g,'');
  if(n.split(' ').length<2||n.length<5){nome.c.classList.add('err');ok=false}
  if(!/^[1-9]{2}9?\d{8}$/.test(z)){zap.c.classList.add('err');ok=false}
  if(m&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)){mail.c.classList.add('err');ok=false}
  if(!cpfOk(c)){cpf.c.classList.add('err');ok=false}
  if(!ck.checked){ac.classList.add('err');ok=false}
  if(!ok){var f=body.querySelector('.err');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
  R.nome=n;R.whatsapp=z;R.email=m;
  enviar(c,hp.value,b,er);
 });
 [nome,zap,mail,cpf].forEach(function(x){body.appendChild(x.c)});
 body.appendChild(hp);body.appendChild(ac);body.appendChild(er);body.appendChild(b);
 body.appendChild(el('p','seg','Teus dados ficam guardados com a VolanteCred. A gente nunca pede dinheiro adiantado.'));
}

// Ordem fixa dos campos. A planilha separa por esta ordem (aba "leads"); mudou aqui, muda lá.
var CAMPOS=['nome','whatsapp','email','cpf','cidade','uf','apps','tempo','corridas','ganho','nota','carro','valor','parcelas','motivo','negativado','conta_app','lgpd','utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','pagina','ua'];
function limpa(v){return String(v==null?'':v).replace(/[\u00a6\r\n\t]/g,' ').slice(0,300)}
function enviar(cpf,hp,b,er){
 enviando=true;b.disabled=true;b.textContent='Enviando';er.hidden=true;
 var id='vc-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 var d={lgpd:'sim',cpf:mascCpf(cpf),ua:navigator.userAgent.slice(0,200)};
 for(var k in R)d[k]=R[k];
 d.whatsapp='55'+R.whatsapp;
 d.apps=(R.apps||[]).map(function(x){return x==='99'?'99 app':x}).join(', ');
 for(var o in ORIG)d[o]=ORIG[o];
 var fim=function(){fb('track','Lead',{currency:'BRL',value:0},{eventID:id});pronto()};
 var falha=function(){enviando=false;b.disabled=false;b.textContent='Enviar meu pré-cadastro';er.textContent='Não deu pra enviar agora. Confere tua internet e toca de novo.';er.hidden=false};
 if(hp)return pronto(); // campo-isca preenchido: robô. Finge sucesso e não envia.
 if(!VC.endpoint||!VC.campo){console.warn('VolanteCred: endpoint vazio, lead não enviado');return fim()}
 // CPF vai só no corpo do POST. Nunca em URL, log ou pixel.
 var carga=id+'\u00a6'+CAMPOS.map(function(c){return limpa(d[c])}).join('\u00a6');
 fetch(VC.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:encodeURIComponent(VC.campo)+'='+encodeURIComponent(carga)})
  .then(fim).catch(falha);
}

function pronto(){
 i=P.length;prog.style.width='100%';cont.textContent='';volta.hidden=true;body.innerHTML='';
 var f=el('div','fim');f.appendChild(el('div','ok','✓'));
 f.appendChild(el('h2','','Pronto!'));
 f.appendChild(el('p','','Teu pré-cadastro entrou na primeira turma. A gente te chama no WhatsApp quando a análise abrir.'));
 body.appendChild(f);window.scrollTo(0,0);
}
})();
