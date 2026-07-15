(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  const menu = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-menu');

  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header?.classList.toggle('scrolled', y > 20);
    if (progress) progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
  };

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menu?.addEventListener('click', () => {
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    menu.classList.toggle('active', open);
    menu.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
  });

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px' }
  );

  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  // Delicate stagger inside repeated editorial grids.
  document.querySelectorAll('.project-list,.service-grid,.process-list,.principle-grid,.scope-grid').forEach(group => {
    [...group.children].forEach((element, index) => {
      if (element.classList.contains('reveal')) element.style.transitionDelay = `${Math.min(index * 70, 240)}ms`;
    });
  });

  const heroVisual = document.querySelector('[data-parallax]');
  if (heroVisual && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let parallaxFrame = 0;
    const updateParallax = () => {
      const shift = Math.max(-22, Math.min(22, scrollY * -0.025));
      heroVisual.style.setProperty('--hero-scroll', `${shift}px`);
      parallaxFrame = 0;
    };
    addEventListener('scroll', () => {
      if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();
  }

  document.querySelectorAll('[data-year]').forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  const page = body.className.match(/page-(projects|services|about|contact)/)?.[1];
  if (page) document.querySelector(`[data-nav="${page}"]`)?.classList.add('active');
  if (body.classList.contains('page-case')) document.querySelector('[data-nav="projects"]')?.classList.add('active');

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      panel?.classList.remove('open');
      body.classList.remove('menu-open');
    });
  });

  /* Subtle hero parallax */
  addEventListener('pointermove', event => {
    const x = (event.clientX / innerWidth - 0.5) * 2;
    const y = (event.clientY / innerHeight - 0.5) * 2;
    document.documentElement.style.setProperty('--cursor-x', x.toFixed(3));
    document.documentElement.style.setProperty('--cursor-y', y.toFixed(3));
  }, { passive: true });

  /* Page transition for internal HTML links */
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.setAttribute('aria-hidden', 'true');
  body.append(transition);

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.toLowerCase().endsWith('.html')) return;

    event.preventDefault();
    body.classList.add('is-leaving');
    setTimeout(() => { location.href = url.href; }, 360);
  });

  /* Custom cursor with a real text magnifier */
  const finePointer = matchMedia('(pointer:fine) and (min-width:901px)');
  if (!finePointer.matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'site-cursor is-hidden';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="site-cursor__ring"></span><span class="site-cursor__dot"></span><span class="site-cursor__action" aria-hidden="true">↗</span>';

  const lens = document.createElement('div');
  lens.className = 'cursor-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.innerHTML = '<div class="cursor-lens__window"><div class="cursor-lens__content"></div></div>';

  body.append(cursor, lens);

  const lensContent = lens.querySelector('.cursor-lens__content');
  const lensSize = 124;
  const lensRadius = lensSize / 2;
  const magnification = 1.82;
  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let currentTarget = null;
  let currentClone = null;
  let frameRequested = false;
  let hasPointer = false;

  const directText = element => Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const isTransparent = color => !color || color === 'transparent' || /rgba\([^)]*,\s*0(?:\.0+)?\)/.test(color);

  const nearestBackground = element => {
    let node = element;
    while (node && node !== document.documentElement) {
      const color = getComputedStyle(node).backgroundColor;
      if (!isTransparent(color)) return color;
      node = node.parentElement;
    }
    return getComputedStyle(body).backgroundColor || '#f2f3f0';
  };

  const parseRgb = color => {
    const values = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    return values?.length === 3 ? values : [242, 243, 240];
  };

  const contrastingEdge = background => {
    const [r, g, b] = parseRgb(background).map(value => value / 255);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.54 ? '#111311' : '#f2f3f0';
  };

  const forbidden = element => element.matches([
    'html', 'body', 'script', 'style', 'noscript',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'img', 'picture', 'video', 'canvas', 'svg', 'path',
    'input', 'textarea', 'select', 'option',
    '.site-cursor', '.site-cursor *', '.cursor-lens', '.cursor-lens *',
    '[data-no-magnify]', '[data-no-magnify] *'
  ].join(','));

  const interactiveSelector = 'a,button,[role="button"],input,textarea,select,summary,label';
  const actionSelector = 'button,[role="button"],input[type="button"],input[type="submit"],.solid-button,.outline-button,.header-cta,.menu-toggle';

  const isSmallText = element => {
    if (!(element instanceof Element) || forbidden(element)) return false;
    // Interactive controls always keep a click-oriented cursor and never activate the lens.
    if (element.closest(interactiveSelector)) return false;
    const ownText = directText(element);
    if (ownText.length < 2) return false;

    const style = getComputedStyle(element);
    const size = Number.parseFloat(style.fontSize);
    if (!Number.isFinite(size) || size > 15.5 || size < 8) return false;
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false;

    const rect = element.getBoundingClientRect();
    return rect.width > 3 && rect.height > 3;
  };

  const targetAtPoint = (x, y) => {
    const stack = document.elementsFromPoint(x, y);
    for (const element of stack) {
      if (isSmallText(element)) return element;
    }
    return null;
  };

  const copyComputedTextStyle = (source, clone) => {
    const style = getComputedStyle(source);
    const properties = [
      'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
      'line-height', 'letter-spacing', 'word-spacing', 'text-align',
      'text-transform', 'text-indent', 'text-decoration', 'text-rendering',
      'white-space', 'word-break', 'overflow-wrap', 'color',
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
      'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
      'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'
    ];
    properties.forEach(property => clone.style.setProperty(property, style.getPropertyValue(property)));
  };

  const buildClone = target => {
    currentClone?.remove();
    const rect = target.getBoundingClientRect();
    const clone = target.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('href');
    clone.removeAttribute('aria-label');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.classList.remove('magnify-active');
    clone.classList.add('cursor-lens__clone');
    copyComputedTextStyle(target, clone);
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.background = 'transparent';
    lensContent.append(clone);
    currentClone = clone;

    const background = nearestBackground(target);
    lens.style.setProperty('--lens-bg', background);
    lens.style.setProperty('--lens-edge', contrastingEdge(background));
  };

  const positionClone = () => {
    if (!currentTarget || !currentClone) return;
    const rect = currentTarget.getBoundingClientRect();
    const left = lensRadius - (mouseX - rect.left) * magnification;
    const top = lensRadius - (mouseY - rect.top) * magnification;
    currentClone.style.left = `${left}px`;
    currentClone.style.top = `${top}px`;
    currentClone.style.transform = `scale(${magnification})`;
  };

  const setMagnifierTarget = target => {
    if (target === currentTarget) return;
    currentTarget?.classList.remove('magnify-active');
    currentTarget = target;

    if (currentTarget) {
      currentTarget.classList.add('magnify-active');
      buildClone(currentTarget);
      cursor.classList.add('is-magnifying');
      lens.classList.add('is-visible');
    } else {
      currentClone?.remove();
      currentClone = null;
      cursor.classList.remove('is-magnifying');
      lens.classList.remove('is-visible');
    }
  };

  const render = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursor.style.left = `${ringX}px`;
    cursor.style.top = `${ringY}px`;

    // Keep the hidden lens exactly under the pointer so its reveal feels like
    // the cursor itself is transforming, never travelling in from a screen edge.
    lens.style.left = `${ringX}px`;
    lens.style.top = `${ringY}px`;
    positionClone();

    if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
      requestAnimationFrame(render);
    } else {
      frameRequested = false;
    }
  };

  const requestRender = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(render);
  };

  addEventListener('pointermove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.classList.remove('is-hidden');

    // On the first pointer event, snap the hidden cursor to the real pointer.
    // Afterwards both cursor and lens share the same eased coordinates, so the
    // ring genuinely morphs into the lens instead of a second object appearing.
    if (!hasPointer) {
      ringX = mouseX;
      ringY = mouseY;
      hasPointer = true;
    }
    cursor.style.left = `${ringX}px`;
    cursor.style.top = `${ringY}px`;
    lens.style.left = `${ringX}px`;
    lens.style.top = `${ringY}px`;

    const eventElement = event.target instanceof Element ? event.target : null;
    const interactive = eventElement?.closest(interactiveSelector) || null;
    const action = eventElement?.closest(actionSelector) || null;
    const target = interactive ? null : targetAtPoint(mouseX, mouseY);
    setMagnifierTarget(target);

    cursor.classList.toggle('is-button', Boolean(action) && !target);
    cursor.classList.toggle('is-interactive', Boolean(interactive) && !action && !target);
    requestRender();
  }, { passive: true });

  addEventListener('pointerdown', () => cursor.classList.add('is-pressed'), { passive: true });
  addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
  addEventListener('blur', () => {
    cursor.classList.add('is-hidden');
    lens.classList.remove('is-visible');
  });
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('is-hidden');
    lens.classList.remove('is-visible');
  });
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

  addEventListener('scroll', () => {
    if (currentTarget) {
      setMagnifierTarget(targetAtPoint(mouseX, mouseY));
      positionClone();
    }
  }, { passive: true });

  addEventListener('resize', () => {
    setMagnifierTarget(null);
  }, { passive: true });
})();
