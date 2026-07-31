/* ==========================================================================
   Dra. Lorena Fecury — interações
   Sem dependências. Só transform/opacity para manter tudo na GPU.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Header "grudado" e botão flutuante
     Ambos reagem à rolagem por sentinelas de IntersectionObserver, e não por
     um listener de scroll: ler window.scrollY força um layout sincrono
     (~30 ms nesta página, por causa do SVG da marca) e o observer entrega a
     mesma informação de graça, dentro do ciclo normal de renderização.
     ------------------------------------------------------------------ */
  var header = document.querySelector('.header');
  var fab = document.querySelector('.fab');
  var sentinel = document.querySelector('.scroll-sentinel');
  var hasIO = 'IntersectionObserver' in window;

  if (header && sentinel && hasIO) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  if (fab && hasIO) {
    var afterHero = document.getElementById('sobre');
    if (afterHero) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        // visível a partir do momento em que a seção é alcançada, e continua
        // visível enquanto ela estiver acima da dobra
        fab.classList.toggle(
          'is-visible',
          e.isIntersecting || e.boundingClientRect.top < 0
        );
      }).observe(afterHero);
    }
  }

  /* ------------------------------------------------------------------
     2. Menu mobile
     ------------------------------------------------------------------ */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav-principal');

  function setMenu(open) {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Reveal on scroll — um único observer, com unobserve após revelar
     ------------------------------------------------------------------ */
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    Array.prototype.forEach.call(revealables, function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     4. Scroll spy — marca o item de navegação da seção visível
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__link[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var active = link.getAttribute('href') === '#' + entry.target.id;
            if (active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ------------------------------------------------------------------
     5. Popover "escolha a clínica" — abre nos botões genéricos de
     WhatsApp (nav mobile, header__cta, hero, fab), que por padrão
     levam à Premium; o link original funciona normalmente sem JS.
     ------------------------------------------------------------------ */
  var waButtons = document.querySelectorAll('[data-wa-open]');
  var waPicker = document.getElementById('wa-picker');

  if (waButtons.length && waPicker) {
    var waLastFocused = null;

    function openWaPicker(e) {
      e.preventDefault();
      waLastFocused = e.currentTarget;
      waPicker.hidden = false;
      document.addEventListener('keydown', onWaKeydown);
      var firstLink = waPicker.querySelector('a');
      if (firstLink) firstLink.focus();
    }

    function closeWaPicker() {
      waPicker.hidden = true;
      document.removeEventListener('keydown', onWaKeydown);
      if (waLastFocused) waLastFocused.focus();
    }

    function onWaKeydown(e) {
      if (e.key === 'Escape') closeWaPicker();
    }

    Array.prototype.forEach.call(waButtons, function (btn) {
      btn.addEventListener('click', openWaPicker);
    });

    Array.prototype.forEach.call(
      waPicker.querySelectorAll('[data-wa-close]'),
      function (el) {
        el.addEventListener('click', closeWaPicker);
      }
    );
  }

  /* Nota: o comprimento do traço de cada ícone (--len, usado pelo redesenho no
     hover) está fixado no HTML. Medir em runtime com getTotalLength() forçava
     um layout sincrono de ~50 ms logo após o parse. Ao alterar o `d` de um
     ícone, remeça o valor no console:
       [...document.querySelectorAll('.card__icon .draw')]
         .map(e => Math.ceil(e.getTotalLength())) */
})();
