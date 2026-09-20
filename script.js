(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const savedTheme = localStorage.getItem('khoa-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.content = theme === 'dark' ? '#16140f' : '#faf8f3';
    if (themeButton) {
      themeButton.setAttribute('aria-label', theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
    }
    if (persist) localStorage.setItem('khoa-theme', theme);
  };

  setTheme(savedTheme || (systemDark ? 'dark' : 'light'), Boolean(savedTheme));
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const header = document.querySelector('[data-header]');
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('#primary-nav');
  const closeMenu = () => {
    menuButton?.classList.remove('is-open');
    nav?.classList.remove('is-open');
    header?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Mở menu');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = !menuButton.classList.contains('is-open');
    menuButton.classList.toggle('is-open', open);
    nav?.classList.toggle('is-open', open);
    header?.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    document.body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const searchClose = document.querySelector('[data-search-close]');
  const globalSearch = document.querySelector('[data-global-search]');
  const searchResults = document.querySelector('[data-search-results]');

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const closeSearch = () => {
    if (!searchPanel || !searchToggle) return;
    searchPanel.hidden = true;
    searchToggle.setAttribute('aria-expanded', 'false');
    searchToggle.setAttribute('aria-label', 'Mở tìm kiếm');
    if (searchResults) searchResults.hidden = true;
  };

  searchToggle?.addEventListener('click', () => {
    if (!searchPanel) return;
    const willOpen = searchPanel.hidden;
    searchPanel.hidden = !willOpen;
    searchToggle.setAttribute('aria-expanded', String(willOpen));
    searchToggle.setAttribute('aria-label', willOpen ? 'Đóng tìm kiếm' : 'Mở tìm kiếm');
    if (willOpen) window.setTimeout(() => globalSearch?.focus(), 20);
  });
  searchClose?.addEventListener('click', closeSearch);

  const searchableItems = [...document.querySelectorAll('[data-search-item]')];
  globalSearch?.addEventListener('input', event => {
    if (!searchResults) return;
    const query = normalize(event.target.value.trim());
    if (!query) {
      searchResults.hidden = true;
      searchResults.replaceChildren();
      return;
    }

    const matches = searchableItems.filter(item => normalize(item.dataset.searchTitle || item.textContent || '').includes(query)).slice(0, 6);
    searchResults.replaceChildren();
    searchResults.hidden = false;

    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Không tìm thấy nội dung phù hợp.';
      searchResults.append(empty);
      return;
    }

    matches.forEach(item => {
      const result = document.createElement('a');
      result.href = item instanceof HTMLAnchorElement ? item.getAttribute('href') || '#notes' : `#${item.closest('section')?.id || 'notes'}`;
      result.textContent = item.querySelector('h3')?.textContent || item.dataset.searchTitle || 'Xem nội dung';
      result.addEventListener('click', closeSearch);
      searchResults.append(result);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSearch();
      closeMenu();
    }
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-38% 0px -56%', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const courseButtons = document.querySelectorAll('[data-course-filter]');
  const courseCards = document.querySelectorAll('[data-course]');
  courseButtons.forEach(button => button.addEventListener('click', () => {
    courseButtons.forEach(item => item.classList.toggle('is-active', item === button));
    const filter = button.dataset.courseFilter;
    courseCards.forEach(card => {
      const categories = card.dataset.course?.split(' ') || [];
      card.classList.toggle('is-filtered', filter !== 'all' && !categories.includes(filter));
    });
  }));

  document.querySelectorAll('.course-summary').forEach(button => button.addEventListener('click', () => {
    const detail = button.closest('.course-card')?.querySelector('.course-detail');
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    if (detail) detail.hidden = !open;
  }));

  const noteButtons = document.querySelectorAll('[data-note-filter]');
  const noteSearch = document.querySelector('[data-notes-search]');
  const noteItems = [...document.querySelectorAll('[data-note]')];
  const noteEmpty = document.querySelector('[data-notes-empty]');
  let activeNoteFilter = 'all';

  const filterNotes = () => {
    const query = normalize(noteSearch?.value.trim() || '');
    let visible = 0;
    noteItems.forEach(item => {
      const categories = item.dataset.note?.split(' ') || [];
      const matchesTopic = activeNoteFilter === 'all' || categories.includes(activeNoteFilter);
      const matchesText = !query || normalize(item.textContent || '').includes(query);
      item.hidden = !(matchesTopic && matchesText);
      if (!item.hidden) visible += 1;
    });
    if (noteEmpty) noteEmpty.hidden = visible !== 0;
  };

  noteButtons.forEach(button => button.addEventListener('click', () => {
    activeNoteFilter = button.dataset.noteFilter || 'all';
    noteButtons.forEach(item => item.classList.toggle('is-active', item === button));
    filterNotes();
  }));
  noteSearch?.addEventListener('input', filterNotes);

  const starfield = document.querySelector('[data-starfield]');
  if (starfield) {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 72; index += 1) {
      const star = document.createElement('span');
      const size = index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1;
      star.style.setProperty('--x', `${(index * 37 + index * index * 3) % 100}%`);
      star.style.setProperty('--y', `${(index * 53 + index * 7) % 100}%`);
      star.style.setProperty('--size', `${size}px`);
      star.style.setProperty('--duration', `${2 + (index % 5)}s`);
      star.style.setProperty('--delay', `${(index * .13) % 4}s`);
      if (index % 9 === 0) star.style.setProperty('--star-color', '#a0c4ff');
      fragment.append(star);
    }
    starfield.append(fragment);
  }

  document.querySelectorAll('[data-current-year]').forEach(item => {
    item.textContent = String(new Date().getFullYear());
  });
})();
