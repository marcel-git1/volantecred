(function(){
'use strict';
var VC=window.VC||{};
var VALORES=[1000,2000,3000,5000,7500,10000];
var UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
function brl(n){return 'R$ '+n.toLocaleString('pt-BR')}

// Perguntas. Texto do Copy Chief (copy/02-quiz.md). "v" é o valor gravado na planilha (o do brief); a aba "resumo" conta por ele.
var P=[
 {k:'apps',a:'Pré-cadastro VolanteCred',t:'Em quais apps você dirige?',d:'Pode marcar mais de um.',multi:1,o:['Uber','99','inDrive','iFood ou outro app de entrega','Outro'],v:['Uber','99','inDrive','iFood ou entregas','Outro']},
 {k:'tempo',t:'Há quanto tempo você dirige por aplicativo?',d:'Seu tempo de app conta na análise.',o:['Menos de 6 meses','De 6 meses a 1 ano','De 1 a 2 anos','De 2 a 5 anos','Mais de 5 anos'],v:['Menos de 6 meses','6 a 12 meses','1 a 2 anos','2 a 5 anos','Mais de 5 anos']},
 {k:'corridas',t:'Quantas corridas você faz por semana?',d:'Pode ser uma média, somando todos os apps. Se você faz entregas, conte as entregas.',o:['Até 50','De 51 a 100','De 101 a 200','Mais de 200'],v:['Até 50','51 a 100','101 a 200','Mais de 200']},
 {k:'ganho',t:'Quanto você ganha por semana com os apps, em média?',d:'Some o que todos os apps pagam pra você numa semana normal.',o:['Até R$ 500','De R$ 501 a R$ 1.000','De R$ 1.001 a R$ 1.500','De R$ 1.501 a R$ 2.500','Mais de R$ 2.500'],v:['Até R$ 500','R$ 501 a R$ 1.000','R$ 1.001 a R$ 1.500','R$ 1.501 a R$ 2.500','Mais de R$ 2.500']},
 {k:'nota',t:'Qual é a sua nota no app?',d:'Use a do app em que você mais roda. Ela aparece no seu perfil de motorista.',o:['Acima de 4,9','De 4,81 a 4,9','De 4,7 a 4,8','Abaixo de 4,7','Não sei'],v:['Acima de 4,9','4,81 a 4,9','4,7 a 4,8','Abaixo de 4,7','Não sei']},
 {k:'carro',t:'O carro (ou a moto) que você usa pra rodar é:',o:['Próprio e quitado','Próprio e financiado','Alugado','De outra pessoa'],v:['Próprio quitado','Próprio financiado','Alugado','De outra pessoa']},
 {k:'valor',a:'Metade do caminho.',t:'De quanto você precisa?',d:function(){return mexeu?'Você escolheu este valor na página. Pode mudar aqui.':'Escolha o valor mais perto do que você precisa hoje.'},o:VALORES.map(brl),v:VALORES},
 {k:'parcelas',t:'Em quantas vezes você quer pagar?',d:'É a sua preferência. As condições finais dependem da análise.',o:['6 vezes','10 vezes','12 vezes'],v:[6,10,12]},
 {k:'motivo',t:'Pra que é o dinheiro?',d:'Escolha o motivo principal.',o:['Manutenção ou conserto do carro','Trocar de carro ou dar entrada em um','Pagar dívidas','Contas da casa','Emergência de saúde','Outro'],v:['Manutenção ou conserto do carro','Trocar ou dar entrada no carro','Pagar dívidas','Contas da casa','Emergência de saúde','Outro']},
 {k:'negativado',t:'Seu nome está negativado hoje?',d:'Pode responder com sinceridade. Estar negativado não impede o pré-cadastro.',o:['Sim','Não','Não sei']},
 {k:'conta_app',t:'Você cadastraria a conta VolanteCred como conta de recebimento no app, pra parcela sair sozinha?',d:'Como funciona: os repasses do app caem na conta VolanteCred, a parcela é descontada e o restante fica com você.',o:['Sim','Sim, se a taxa for boa','Não']},
 {k:'local',a:'Quase lá.',t:'Em que cidade você roda?',d:'Pra gente saber de onde vêm os motoristas da primeira turma.',form:'local'},
 {k:'contato',a:'Última etapa.',t:'Pra onde a gente chama você?',d:'A gente fala com você pelo WhatsApp quando a análise abrir. O CPF é usado só na pré-análise de crédito.',form:'contato'},
 {k:'aceite',t:'Falta só a sua autorização',form:'aceite'}
];
var R={},i=0,enviando=false,iniciou=false,mexeu=false,CPF='',HP='';
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
if(rng){rng.addEventListener('input',function(){mexeu=true;val.textContent=brl(VALORES[+rng.value])})}

function abrir(){
 if(rng&&mexeu&&R.valor==null)R.valor=VALORES[+rng.value];
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
 cont.textContent='';volta.hidden=false;
 if(p.a)body.appendChild(el('p','av',p.a));
 body.appendChild(el('h2','',p.t));
 if(p.d)body.appendChild(el('p','dica',typeof p.d==='function'?p.d():p.d));
 if(p.form==='local')return telaLocal();
 if(p.form==='contato')return telaContato();
 if(p.form==='aceite')return telaAceite();
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
    b.classList.toggle('on');er.hidden=true;
   }else{
    R[p.k]=v;ops.querySelectorAll('.op').forEach(function(o){o.classList.remove('on')});b.classList.add('on');
    setTimeout(avanca,180);
   }
  });
  ops.appendChild(b);
 });
 body.appendChild(ops);
 var er=el('p','erro','Escolha uma opção pra continuar.');er.hidden=true;
 if(p.multi){var prox=el('button','btn','Continuar');prox.type='button';prox.addEventListener('click',function(){if((R[p.k]||[]).length)avanca();else er.hidden=false});body.appendChild(er);body.appendChild(prox)}
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
 var cid=campo('f_cidade','Cidade',{type:'text',autocomplete:'address-level2',maxlength:'60',placeholder:'Ex.: Campinas'},'Preencha a cidade e o estado.');
 var uf=campo('f_uf','Estado',{tag:'select',autocomplete:'address-level1'},'Preencha a cidade e o estado.');
 uf.i.appendChild(new Option('Escolha o estado',''));
 UFS.forEach(function(u){uf.i.appendChild(new Option(u,u))});
 cid.i.value=R.cidade||'';uf.i.value=R.uf||'';
 var b=el('button','btn','Continuar');b.type='button';
 b.addEventListener('click',function(){
  var c=cid.i.value.trim(),ok=true;
  if(c.length<2){cid.c.classList.add('err');ok=false}
  else if(!uf.i.value){uf.c.classList.add('err');ok=false}
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
 var nome=campo('f_nome','Nome completo',{type:'text',autocomplete:'name',maxlength:'80',placeholder:'Como está no seu documento'},'Escreva seu nome completo.');
 var zap=campo('f_zap','WhatsApp com DDD',{type:'tel',inputmode:'numeric',autocomplete:'tel-national',placeholder:'(11) 91234-5678'},'Confira o número, com DDD.');
 var mail=campo('f_mail','E-mail',{type:'email',autocomplete:'email',maxlength:'120',placeholder:'seunome@email.com'},'Confira o e-mail, ou deixe em branco.',true);
 var cpf=campo('f_cpf','CPF',{type:'text',inputmode:'numeric',autocomplete:'off',placeholder:'000.000.000-00'},'Confira o CPF. O número não bateu.');
 var hp=el('input','hp');hp.type='text';hp.name='site';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
 nome.i.value=R.nome||'';zap.i.value=R.whatsapp?mascTel(R.whatsapp):'';mail.i.value=R.email||'';cpf.i.value=CPF?mascCpf(CPF):'';
 zap.i.addEventListener('input',function(){zap.i.value=mascTel(zap.i.value)});
 cpf.i.addEventListener('input',function(){cpf.i.value=mascCpf(cpf.i.value)});
 var b=el('button','btn','Continuar');b.type='button';
 b.addEventListener('click',function(){
  var ok=true,n=nome.i.value.trim().replace(/\s+/g,' '),z=zap.i.value.replace(/\D/g,''),m=mail.i.value.trim(),c=cpf.i.value.replace(/\D/g,'');
  if(n.split(' ').length<2||n.length<5){nome.c.classList.add('err');ok=false}
  if(!/^[1-9]{2}9?\d{8}$/.test(z)){zap.c.classList.add('err');ok=false}
  if(m&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)){mail.c.classList.add('err');ok=false}
  if(!cpfOk(c)){cpf.c.classList.add('err');ok=false}
  if(!ok){var f=body.querySelector('.err');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
  R.nome=n;R.whatsapp=z;R.email=m;CPF=c;HP=hp.value; // CPF fica só na memória da página até o envio
  avanca();
 });
 [nome,zap,mail,cpf].forEach(function(x){body.appendChild(x.c)});
 body.appendChild(hp);
 body.appendChild(el('p','seg','Este pré-cadastro não pede senha nem pagamento.'));
 body.appendChild(b);
}

var ACEITE=false;
function telaAceite(){
 var ac=el('label','aceite'),ck=el('input');ck.type='checkbox';ck.id='f_lgpd';
 var tx=el('span');tx.appendChild(document.createTextNode('Autorizo a VolanteCred a usar meus dados para pré-análise de crédito e consulta a birôs de crédito, e a falar comigo pelo WhatsApp. Li a '));
 var a=el('a','','Política de Privacidade');a.href='privacidade.html';a.target='_blank';a.rel='noopener';tx.appendChild(a);tx.appendChild(document.createTextNode('.'));
 ac.appendChild(ck);ac.appendChild(tx);
 var er=el('p','erro');er.hidden=true;
 ck.addEventListener('change',function(){ac.classList.remove('err');er.hidden=true});
 var b=el('button','btn','Enviar meu pré-cadastro');b.type='button';
 b.addEventListener('click',function(){
  if(enviando)return;
  ACEITE=ck.checked;
  if(!cpfOk(CPF)||!R.whatsapp){i--;return tela()}
  enviar(CPF,HP,b,er);
 });
 body.appendChild(ac);
 body.appendChild(el('p','dica','O pré-cadastro é grátis e não garante aprovação. A VolanteCred nunca pede pagamento antes.'));
 body.appendChild(er);body.appendChild(b);
}

// Ordem fixa dos campos. A planilha separa por esta ordem (aba "leads"); mudou aqui, muda lá.
var CAMPOS=['nome','whatsapp','email','cpf','cidade','uf','apps','tempo','corridas','ganho','nota','carro','valor','parcelas','motivo','negativado','conta_app','lgpd','utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','pagina','ua','controle'];
function limpa(v){return String(v==null?'':v).replace(/[\u00a6\r\n\t]/g,' ').slice(0,300)}
function enviar(cpf,hp,b,er){
 enviando=true;b.disabled=true;b.textContent='Enviando';er.hidden=true;
 var id='vc-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 var d={lgpd:ACEITE?'sim':'não',cpf:mascCpf(cpf),ua:navigator.userAgent.slice(0,200),controle:mexeu?'mexeu':'não mexeu'};
 for(var k in R)d[k]=R[k];
 d.whatsapp='55'+R.whatsapp;
 d.apps=(R.apps||[]).map(function(x){return x==='99'?'99 app':x}).join(', ');
 for(var o in ORIG)d[o]=ORIG[o];
 var fim=function(){fb('track','Lead',{currency:'BRL',value:Number(R.valor)||0},{eventID:id});pronto()};
 var falha=function(){enviando=false;b.disabled=false;b.textContent='Enviar meu pré-cadastro';er.textContent='Não deu pra enviar. Confira sua internet e toque em Enviar de novo.';er.hidden=false};
 if(hp)return pronto(); // campo-isca preenchido: robô. Finge sucesso e não envia.
 if(!VC.endpoint||!VC.campo){console.warn('VolanteCred: endpoint vazio, lead não enviado');return fim()}
 // CPF vai só no corpo do POST. Nunca em URL, log ou pixel.
 var carga=id+'\u00a6'+CAMPOS.map(function(c){return limpa(d[c])}).join('\u00a6');
 fetch(VC.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:encodeURIComponent(VC.campo)+'='+encodeURIComponent(carga)})
  .then(fim).catch(falha);
}

function pronto(){
 i=P.length;prog.style.width='100%';cont.textContent='';volta.hidden=true;body.innerHTML='';CPF='';
 var pn=(R.nome||'').split(' ')[0];pn=pn?pn.charAt(0).toUpperCase()+pn.slice(1):'';
 var f=el('div','fim');f.appendChild(el('div','ok','✓'));
 f.appendChild(el('h2','',(pn?'Pronto, '+pn+'!':'Pronto!')+' Seu pré-cadastro entrou na primeira turma.'));
 f.appendChild(el('p','','A gente chama você no WhatsApp quando a análise abrir. Não precisa fazer mais nada agora.'));
 f.appendChild(el('p','imp','Importante: a VolanteCred nunca pede pagamento, taxa ou depósito pra liberar crédito. Se alguém pedir dinheiro em nosso nome, é golpe. Não pague.'));
 body.appendChild(f);window.scrollTo(0,0);
}
})();
