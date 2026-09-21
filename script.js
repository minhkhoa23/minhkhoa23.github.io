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

  globalSearch?.addEventListener('input', event => {
    if (!searchResults) return;
    const query = normalize(event.target.value.trim());
    if (!query) {
      searchResults.hidden = true;
      searchResults.replaceChildren();
      return;
    }

    const searchableItems = [...document.querySelectorAll('[data-search-item]')];
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

  const courses = [
    { code: 'BAA00021', name: 'Thể dục 1', group: 'general' },
    { code: 'BAA00022', name: 'Thể dục 2', group: 'general' },
    { code: 'BAA00101', name: 'Triết học Mác - Lênin', group: 'general' },
    { code: 'BAA00102', name: 'Kinh tế chính trị Mác - Lênin', group: 'general' },
    { code: 'BAA00103', name: 'Chủ nghĩa xã hội khoa học', group: 'general' },
    { code: 'BAA00104', name: 'Lịch sử Đảng Cộng sản Việt Nam', group: 'general' },
    { code: 'CSC00004', name: 'Nhập môn công nghệ thông tin', group: 'general' },
    { code: 'MTH00021', name: 'Vi tích phân 1', group: 'general' },
    { code: 'MTH00022', name: 'Vi tích phân 2', group: 'general' },
    { code: 'MTH00035', name: 'Đại số tuyến tính', group: 'general' },
    { code: 'MTH00044', name: 'Xác suất thống kê', group: 'general' },
    { code: 'MTH00045', name: 'Toán rời rạc', group: 'general' },
    { code: 'MTH00050', name: 'Toán học tổ hợp', group: 'general' },
    { code: 'BAA00003', name: 'Tư tưởng Hồ Chí Minh', group: 'general' },
    { code: 'BAA00004', name: 'Pháp luật đại cương', group: 'general' },
    { code: 'BAA00005', name: 'Kinh tế đại cương', group: 'general' },
    { code: 'MTH00051', name: 'Toán ứng dụng và thống kê', group: 'general' },
    { code: 'PHY00005', name: 'Vật lý đại cương 1', group: 'general' },
    { code: 'PHY00007', name: 'Vật lý cho Công nghệ thông tin', group: 'general' },
    { code: 'CSC10001', name: 'Nhập môn lập trình', group: 'foundation' },
    { code: 'CSC10002', name: 'Kỹ thuật lập trình', group: 'foundation' },
    { code: 'CSC10003', name: 'Phương pháp lập trình hướng đối tượng', group: 'foundation' },
    { code: 'CSC10004', name: 'Cấu trúc dữ liệu và giải thuật', group: 'foundation' },
    { code: 'CSC10006', name: 'Cơ sở dữ liệu', group: 'foundation' },
    { code: 'CSC10007', name: 'Hệ điều hành', group: 'foundation' },
    { code: 'CSC10008', name: 'Mạng máy tính', group: 'foundation' },
    { code: 'CSC10009', name: 'Hệ thống máy tính', group: 'foundation' },
    { code: 'CSC10012', name: 'Cơ sở lập trình', group: 'foundation' },
    { code: 'CSC13002', name: 'Nhập môn công nghệ phần mềm', group: 'foundation' },
    { code: 'CSC14003', name: 'Cơ sở trí tuệ nhân tạo', group: 'foundation' },
    { code: 'CSC10103', name: 'Khởi nghiệp', group: 'specialized' },
    { code: 'CSC10121', name: 'Kỹ năng mềm', group: 'specialized' },
    { code: 'CSC14005', name: 'Nhập môn học máy', group: 'specialized' },
    { code: 'CSC14119', name: 'Nhập môn khoa học dữ liệu', group: 'specialized' },
    { code: 'CSC14120', name: 'Lập trình song song', group: 'specialized' },
    { code: 'CSC15004', name: 'Học thống kê', group: 'specialized' },
    { code: 'CSC15005', name: 'Nhập môn mã hóa – mật mã', group: 'specialized' },
    { code: 'CSC15006', name: 'Nhập môn xử lý ngôn ngữ tự nhiên', group: 'specialized' },
    { code: 'CSC15007', name: 'Thống kê máy tính và ứng dụng', group: 'specialized' },
    { code: 'CSC15011', name: 'Nhập môn ngôn ngữ học thống kê và ứng dụng', group: 'specialized' },
    { code: 'CSC17103', name: 'Khai thác dữ liệu đồ thị', group: 'specialized' },
    { code: 'CSC14118', name: 'Nhập môn dữ liệu lớn', group: 'specialized' },
    { code: 'CSC15012', name: 'Ứng dụng xử lý ngôn ngữ tự nhiên trong doanh nghiệp', group: 'specialized' },
    { code: 'CSC15105', name: 'Khai thác dữ liệu văn bản và ứng dụng', group: 'specialized' },
  ];

  const courseGroupLabels = {
    general: 'Đại cương',
    foundation: 'Cơ sở ngành',
    specialized: 'Chuyên ngành',
  };
  const courseCatalog = document.querySelector('[data-course-catalog]');
  const courseSearch = document.querySelector('[data-course-search]');
  const courseCount = document.querySelector('[data-course-count]');
  const courseEmpty = document.querySelector('[data-course-empty]');
  const courseMoreWrap = document.querySelector('[data-course-more-wrap]');
  const courseMoreButton = document.querySelector('[data-course-more]');
  const courseVisibleCount = document.querySelector('[data-course-visible]');
  const courseTotalCount = document.querySelector('[data-course-total]');
  const courseButtons = document.querySelectorAll('[data-course-filter]');
  const courseViewButtons = document.querySelectorAll('[data-course-view]');
  const coursePageSize = 12;
  let activeCourseFilter = 'all';
  let visibleCourseLimit = coursePageSize;

  const createCourseItem = course => {
    const item = document.createElement('article');
    item.className = 'course-item';
    item.dataset.group = course.group;
    item.dataset.searchItem = '';
    item.dataset.searchTitle = `${course.code} ${course.name} ${courseGroupLabels[course.group]}`;
    item.setAttribute('aria-label', `${course.code} — ${course.name}, ${courseGroupLabels[course.group]}`);

    const code = document.createElement('span');
    code.className = 'course-code';
    code.textContent = course.code;

    const name = document.createElement('h3');
    name.textContent = course.name;

    const group = document.createElement('span');
    group.className = 'course-group';
    group.textContent = courseGroupLabels[course.group];

    const state = document.createElement('span');
    state.className = 'course-state';
    state.innerHTML = '<i aria-hidden="true"></i> Ghi chú đang cập nhật';

    item.append(code, name, group, state);
    return item;
  };

  const renderCourses = () => {
    if (!courseCatalog) return;
    const query = normalize(courseSearch?.value.trim() || '');
    const filtered = courses.filter(course => {
      const matchesGroup = activeCourseFilter === 'all' || course.group === activeCourseFilter;
      const matchesSearch = !query || normalize(`${course.code} ${course.name}`).includes(query);
      return matchesGroup && matchesSearch;
    });

    const visibleCourses = filtered.slice(0, visibleCourseLimit);
    const remaining = Math.max(0, filtered.length - visibleCourses.length);
    const fragment = document.createDocumentFragment();
    visibleCourses.forEach(course => fragment.append(createCourseItem(course)));
    courseCatalog.replaceChildren(fragment);
    if (courseCount) courseCount.textContent = String(filtered.length);
    if (courseVisibleCount) courseVisibleCount.textContent = String(visibleCourses.length);
    if (courseTotalCount) courseTotalCount.textContent = String(filtered.length);
    if (courseEmpty) courseEmpty.hidden = filtered.length !== 0;
    if (courseMoreWrap) courseMoreWrap.hidden = remaining === 0;
    if (courseMoreButton) courseMoreButton.innerHTML = `Xem thêm ${Math.min(coursePageSize, remaining)} môn <span aria-hidden="true">↓</span>`;
  };

  courseButtons.forEach(button => button.addEventListener('click', () => {
    activeCourseFilter = button.dataset.courseFilter || 'all';
    visibleCourseLimit = coursePageSize;
    courseButtons.forEach(item => item.classList.toggle('is-active', item === button));
    renderCourses();
  }));
  courseSearch?.addEventListener('input', () => {
    visibleCourseLimit = coursePageSize;
    renderCourses();
  });
  courseMoreButton?.addEventListener('click', () => {
    visibleCourseLimit += coursePageSize;
    renderCourses();
  });

  const setCourseView = (view, persist = true) => {
    const safeView = view === 'list' ? 'list' : 'grid';
    if (courseCatalog) courseCatalog.dataset.view = safeView;
    courseViewButtons.forEach(button => {
      const active = button.dataset.courseView === safeView;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (persist) localStorage.setItem('khoa-course-view', safeView);
  };

  courseViewButtons.forEach(button => button.addEventListener('click', () => setCourseView(button.dataset.courseView)));
  setCourseView(localStorage.getItem('khoa-course-view') || 'grid', false);
  renderCourses();

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
