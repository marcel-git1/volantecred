/* RedTrack na VolanteCred (11/11/26, Redtracker, pedido do Gestor de Tráfego e do Marcel).
   Vai no site como assets/rt.js, carregado DEPOIS do config.js e ANTES do quiz.js:
     <script src="assets/config.js"></script>
     <script src="assets/rt.js"></script>
     <script src="assets/quiz.js?v=..."></script>
   E no config.js, uma linha nova dentro de window.VC:
     rt: 'https://i0c5a.ttrk.io',   // RedTrack (domínio neutro do RT, sem oriameds). Vazio = desligado.

   O que faz:
   1. Clique: só quando a URL traz cmpid (veio do anúncio) ou rtkcid, carrega o uniclick.js do RedTrack.
      Ele registra o clique na campanha "Meta - VolanteCred (CT 002, direto)" 6af4c89a7cb9163b9c5deeb9
      com os sub1..sub8 do anúncio e grava o cookie rtkclickid-store em volantecred.online (30 dias).
      Visita orgânica não carrega nada.
   2. window.vcRT('QuizStarted') e window.vcRT('Lead'): mandam a conversão pro RedTrack pelo clique
      guardado (postback do navegador). Uma de cada por clique (rdtk_event_id = qs_<clique> / lead_<clique>).
      Sem clique do anúncio, não manda nada.
   Duas linhas no quiz.js (ver o fim deste arquivo). Sem dado da pessoa: só o id do clique e o tipo.
   __rtkMetaCapiLoading: impede o uniclick.js de puxar do unpkg.com (sem versão fixa) o param-builder
   da CAPI do RedTrack, que não usamos. Mesmo cuidado do pixels.js da Oria. */
(function () {
  var H = (window.VC && window.VC.rt) || '';
  if (!H) { window.vcRT = function () {}; return; }
  var RX = /^[a-f0-9]{24}$/;
  function clique() {
    try { var q = new URLSearchParams(location.search).get('rtkcid'); if (q && RX.test(q)) return q; } catch (e) {}
    var m = document.cookie.match(/(?:^|;)\s*rtkclickid-store=([a-f0-9]{24})/);
    return m ? m[1] : '';
  }
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('cmpid') || q.get('rtkcid')) {
      window.__rtkMetaCapiLoading = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = H + '/uniclick.js?attribution=lastpaid&cookiedomain=volantecred.online&cookieduration=30&defaultcampaignid=&regviewonce=false&rtkcidurl=false';
      document.head.appendChild(s);
    }
  } catch (e) {}
  var feito = {};
  window.vcRT = function (tipo) {
    if (feito[tipo]) return; feito[tipo] = 1;
    var n = 0;
    (function vai() {
      var c = clique();
      if (!c) { if (++n < 20) setTimeout(vai, 500); return; } // espera o uniclick gravar o clique (até 10 s)
      var u = H + '/postback?clickid=' + c + '&type=' + encodeURIComponent(tipo) +
              '&rdtk_event_id=' + (tipo === 'Lead' ? 'lead_' : 'qs_') + c;
      try { fetch(u, { mode: 'no-cors', keepalive: true, credentials: 'omit' }); }
      catch (e) { (new Image()).src = u; }
    })();
  };
})();

/* Duas linhas no quiz.js:
   1) Em abrir(), junto do InitiateCheckout:
        if(!iniciou){iniciou=true;fb('track','InitiateCheckout');window.vcRT&&vcRT('QuizStarted');history.pushState({q:1},'')}
   2) Em enviar(), dentro de fim (só roda quando o envio deu certo; o campo-isca não passa por ele):
        var fim=function(){fb('track','Lead',{currency:'BRL',value:Number(R.valor)||0},{eventID:id});window.vcRT&&vcRT('Lead');pronto()};
   Link de teste (depois do deploy): https://volantecred.online/?cmpid=6af4c89a7cb9163b9c5deeb9&sub1=rtktest_vc&sub4=teste&utm_source=teste */
