(function(){
  function ready(fn){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',fn); } else { fn(); } }
  ready(function(){
    var body=document.body;

    // Loader
    var finishLoader=function(){ setTimeout(function(){ body.classList.add('denis-loaded'); },420); };
    if(document.readyState==='complete') finishLoader(); else window.addEventListener('load',finishLoader,{once:true});
    setTimeout(function(){ body.classList.add('denis-loaded'); },2200);

    // Scroll progress
    var progress=document.getElementById('denis-scroll-progress');
    function updateProgress(){
      if(!progress) return;
      var h=document.documentElement.scrollHeight-window.innerHeight;
      var p=h>0?Math.min(100,Math.max(0,(window.scrollY/h)*100)):0;
      progress.style.width=p+'%';
    }
    updateProgress();
    window.addEventListener('scroll',updateProgress,{passive:true});
    window.addEventListener('resize',updateProgress,{passive:true});

    // Reveal existing records + custom sections
    var nodes=[];
    ['#rec2134086881','#rec2133460271','#approach','#rec2139639931','#rec2139618621','#rec2133460371','#rec2143213511','#rec2156010151','#rec2151574971'].forEach(function(sel){ var el=document.querySelector(sel); if(el) nodes.push(el); });
    document.querySelectorAll('.denis-approach__card,.denis-approach__base,.denis-experience__head,.denis-experience__card').forEach(function(el,i){ el.setAttribute('data-denis-delay',String(Math.min(i%4,3))); nodes.push(el); });
    nodes.forEach(function(el){ el.classList.add('denis-reveal'); });
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('denis-inview'); io.unobserve(e.target); } }); },{threshold:.07,rootMargin:'0px 0px -5% 0px'});
      nodes.forEach(function(el){ io.observe(el); });
    } else { nodes.forEach(function(el){ el.classList.add('denis-inview'); }); }

    // Cursor v2: direct dot + delayed halo; morphs on interactive items
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      var pointer=document.querySelector('.denis-cursor');
      var halo=document.querySelector('.denis-cursor-dot');
      if(pointer&&halo){
        var mx=-100,my=-100,hx=-100,hy=-100;
        document.addEventListener('mousemove',function(e){
          mx=e.clientX; my=e.clientY;
          body.classList.add('denis-pointer-on');
          pointer.style.transform='translate3d('+mx+'px,'+my+'px,0)';
        },{passive:true});
        document.addEventListener('mouseleave',function(){ body.classList.remove('denis-pointer-on'); });
        function cursorLoop(){ hx+=(mx-hx)*.14; hy+=(my-hy)*.14; halo.style.transform='translate3d('+hx+'px,'+hy+'px,0)'; requestAnimationFrame(cursorLoop); }
        cursorLoop();
        document.addEventListener('mouseover',function(e){
          var detail=e.target.closest('.denis-experience__card');
          var interactive=e.target.closest('a,button,[role="button"],input,textarea,select,.t849__header');
          var dark=e.target.closest('.denis-experience,#rec2133465911');
          body.classList.toggle('denis-cursor-detail',!!detail);
          body.classList.toggle('denis-cursor-hover',!!interactive&&!detail);
          body.classList.toggle('denis-cursor-light',!!dark);
        });
        document.addEventListener('mouseout',function(e){
          if(!e.relatedTarget){ body.classList.remove('denis-cursor-detail','denis-cursor-hover','denis-cursor-light'); return; }
          var detail=e.relatedTarget.closest&&e.relatedTarget.closest('.denis-experience__card');
          var interactive=e.relatedTarget.closest&&e.relatedTarget.closest('a,button,[role="button"],input,textarea,select,.t849__header');
          var dark=e.relatedTarget.closest&&e.relatedTarget.closest('.denis-experience,#rec2133465911');
          body.classList.toggle('denis-cursor-detail',!!detail);
          body.classList.toggle('denis-cursor-hover',!!interactive&&!detail);
          body.classList.toggle('denis-cursor-light',!!dark);
        });
      }
    }

    // Modal engine
    var lastFocus=null;
    function openModal(modal){
      if(!modal) return;
      lastFocus=document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      body.classList.add('denis-modal-open');
      body.classList.remove('denis-cursor-detail');
      var panel=modal.querySelector('.denis-modal__panel');
      setTimeout(function(){ if(panel) panel.focus(); },30);
    }
    function closeModal(modal){
      if(!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      body.classList.remove('denis-modal-open');
      if(lastFocus&&lastFocus.focus) lastFocus.focus();
    }
    document.addEventListener('click',function(e){
      var close=e.target.closest('[data-modal-close]');
      if(close){ e.preventDefault(); e.stopPropagation(); closeModal(close.closest('.denis-modal')); return; }
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){ var open=document.querySelector('.denis-modal.is-open'); if(open) closeModal(open); }
    });
    document.querySelectorAll('[data-modal-close]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        closeModal(btn.closest('.denis-modal'));
      });
    });

    // Detailed experience content
    var experienceData={
      isaev:{
        kicker:'2020—2024 · специалист по аддиктивному поведению',
        title:'Клиника доктора Исаева',
        html:'<p>В клинике я работал с зависимыми формами поведения в клиническом контексте. В этой работе мне было важно учитывать не только саму зависимость, но и сопутствующие личностные и психологические трудности.</p><h3>С чем я работал в этот период</h3><ul><li>зависимые формы поведения и разные проявления аддиктивного поведения;</li><li>личностные расстройства;</li><li>различные психопатологические проявления;</li><li>психологическая помощь с учётом сложности состояния и жизненной ситуации человека.</li></ul><div class="denis-modal__note">Этот этап дал мне большой опыт работы со сложными запросами, где зависимость часто существует не отдельно, а вместе с другими психологическими трудностями.</div>'
      },
      private:{
        kicker:'2017—2024 · психологическое консультирование',
        title:'Частная практика',
        html:'<p>В частной практике я рассматриваю запрос не как отдельный симптом, а в контексте отношений, эмоционального состояния, жизненного этапа и привычных способов справляться с трудностями.</p><h3>С какими запросами я работаю</h3><ul><li>любые формы зависимости и созависимые отношения;</li><li>личностные и профессиональные кризисы;</li><li>повышенная тревожность и раздражительность;</li><li>эмоциональная нестабильность, неуверенность в себе и депрессивные состояния;</li><li>семейные сессии по вопросам взаимоотношений и проживания сложных периодов.</li></ul><div class="denis-modal__note">В частной практике я соединяю опыт работы с зависимостями и гештальт-подход, сохраняя внимание к вашей индивидуальной истории, отношениям и текущей жизненной ситуации.</div>'
      },
      mnpc:{
        kicker:'2017—2020 · специалист по аддиктивному поведению',
        title:'МНПЦ наркологии',
        html:'<p>В Московском научно-практическом центре наркологии я работал с зависимостями различных форм и проявлений. Этот период дал мне продолжительный профильный опыт в теме аддиктивного поведения.</p><h3>На чём была сосредоточена моя работа</h3><ul><li>зависимости различных форм;</li><li>разные проявления аддиктивного поведения;</li><li>психологические факторы, сопровождающие зависимое поведение;</li><li>поддержка человека в период, когда привычный способ справляться с жизнью становится разрушительным.</li></ul><div class="denis-modal__note">Этот этап стал важной частью моей специализации и напрямую связан с темой зависимостей и психологической помощью людям с аддиктивным поведением.</div>'
      }
    };
    var experienceModal=document.getElementById('denis-experience-modal');
    function openExperience(card){
      if(!experienceModal||!card) return;
      var data=experienceData[card.getAttribute('data-experience')];
      if(!data) return;
      var kicker=document.getElementById('denis-modal-kicker');
      var title=document.getElementById('denis-modal-title');
      var content=document.getElementById('denis-modal-content');
      if(kicker) kicker.textContent=data.kicker;
      if(title) title.textContent=data.title;
      if(content) content.innerHTML=data.html+'<button class="denis-modal__bottom-close" type="button" data-modal-close>Закрыть</button>'; 
      openModal(experienceModal);
    }
    document.querySelectorAll('.denis-experience__card[data-experience]').forEach(function(card){
      card.addEventListener('click',function(){ openExperience(card); });
      card.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openExperience(card); } });
    });

    // Education modal from the user-provided education/course list
    var educationModal=document.getElementById('denis-education-modal');
    document.querySelectorAll('[data-open-education]').forEach(function(btn){ btn.addEventListener('click',function(){ openModal(educationModal); }); });
  });
})();
