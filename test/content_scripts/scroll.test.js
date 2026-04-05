const fs = require('fs');
const path = require('path');

const scrollCode = fs.readFileSync(
  path.join(__dirname, '../../content_scripts/scroll.js'),
  'utf8'
);

function defineScrollableElement(elem, options) {
  let scrollTop = options.scrollTop || 0;
  let scrollLeft = options.scrollLeft || 0;

  Object.defineProperty(elem, 'clientHeight', {
    configurable: true,
    value: options.clientHeight || 0,
  });
  Object.defineProperty(elem, 'clientWidth', {
    configurable: true,
    value: options.clientWidth || 0,
  });
  Object.defineProperty(elem, 'scrollHeight', {
    configurable: true,
    value: options.scrollHeight || 0,
  });
  Object.defineProperty(elem, 'scrollWidth', {
    configurable: true,
    value: options.scrollWidth || 0,
  });
  Object.defineProperty(elem, 'offsetHeight', {
    configurable: true,
    value: options.offsetHeight || options.clientHeight || 0,
  });
  Object.defineProperty(elem, 'offsetWidth', {
    configurable: true,
    value: options.offsetWidth || options.clientWidth || 0,
  });
  Object.defineProperty(elem, 'scrollTop', {
    configurable: true,
    get() {
      return scrollTop;
    },
    set(value) {
      if (options.lockY) return;
      var maxScrollTop = Math.max(0, elem.scrollHeight - elem.clientHeight);
      scrollTop = Math.max(0, Math.min(value, maxScrollTop));
    },
  });
  Object.defineProperty(elem, 'scrollLeft', {
    configurable: true,
    get() {
      return scrollLeft;
    },
    set(value) {
      if (options.lockX) return;
      var maxScrollLeft = Math.max(0, elem.scrollWidth - elem.clientWidth);
      scrollLeft = Math.max(0, Math.min(value, maxScrollLeft));
    },
  });
}

function loadScrollModule() {
  global.settings = {
    scrollstep: 60,
    smoothscroll: false,
    fullpagescrollpercent: 0,
  };
  global.Object.clone = (obj) => Object.assign({}, obj);
  global.Scroll = undefined;
  global.__testScroll = undefined;
  global.innerHeight = 900;
  global.innerWidth = 1200;
  global.requestAnimationFrame = jest.fn();
  global.cancelAnimationFrame = jest.fn();

  let mouseDownListener;
  const originalAddEventListener = document.addEventListener.bind(document);
  jest.spyOn(document, 'addEventListener').mockImplementation((type, listener) => {
    if (type === 'mousedown') {
      mouseDownListener = listener;
    }
    return originalAddEventListener(type, listener);
  });

  eval(scrollCode + '\nglobalThis.__testScroll = Scroll;');
  document.addEventListener.mockRestore();
  global.Scroll = global.__testScroll;

  return { mouseDownListener };
}

describe('Scroll.scroll', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  test('scrolls the active scroll container when the clicked element does not move', () => {
    const root = document.createElement('div');
    const clickedElem = document.createElement('div');
    clickedElem.style.overflowY = 'auto';
    defineScrollableElement(clickedElem, {
      clientHeight: 100,
      clientWidth: 90,
      offsetWidth: 100,
      scrollHeight: 400,
      lockY: true,
    });

    const activeScrollParent = document.createElement('div');
    activeScrollParent.style.overflowY = 'auto';
    defineScrollableElement(activeScrollParent, {
      clientHeight: 100,
      clientWidth: 90,
      offsetWidth: 100,
      scrollHeight: 400,
    });
    const activeElem = document.createElement('button');
    activeScrollParent.appendChild(activeElem);

    root.appendChild(clickedElem);
    root.appendChild(activeScrollParent);
    document.body.appendChild(root);

    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: root,
    });
    defineScrollableElement(root, {
      clientHeight: 500,
      scrollHeight: 500,
    });
    activeElem.focus();

    const { mouseDownListener } = loadScrollModule();
    mouseDownListener({ isTrusted: true, srcElement: clickedElem });

    Scroll.scroll('down', 1);

    expect(clickedElem.scrollTop).toBe(0);
    expect(activeScrollParent.scrollTop).toBe(60);
  });

  test('keeps using the clicked scroll container when it actually scrolls', () => {
    const root = document.createElement('div');
    const clickedElem = document.createElement('div');
    clickedElem.style.overflowY = 'auto';
    defineScrollableElement(clickedElem, {
      clientHeight: 100,
      clientWidth: 90,
      offsetWidth: 100,
      scrollHeight: 400,
    });

    const activeScrollParent = document.createElement('div');
    activeScrollParent.style.overflowY = 'auto';
    defineScrollableElement(activeScrollParent, {
      clientHeight: 100,
      clientWidth: 90,
      offsetWidth: 100,
      scrollHeight: 400,
    });
    const activeElem = document.createElement('button');
    activeScrollParent.appendChild(activeElem);

    root.appendChild(clickedElem);
    root.appendChild(activeScrollParent);
    document.body.appendChild(root);

    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: root,
    });
    defineScrollableElement(root, {
      clientHeight: 500,
      scrollHeight: 500,
    });
    activeElem.focus();

    const { mouseDownListener } = loadScrollModule();
    mouseDownListener({ isTrusted: true, srcElement: clickedElem });

    Scroll.scroll('down', 1);

    expect(clickedElem.scrollTop).toBe(60);
    expect(activeScrollParent.scrollTop).toBe(0);
  });

  test('retries with relaxed vertical detection when the original check misses overlay containers', () => {
    const root = document.createElement('div');
    const overlayScroll = document.createElement('div');
    overlayScroll.style.overflowY = 'auto';
    defineScrollableElement(overlayScroll, {
      clientHeight: 300,
      offsetWidth: 300,
      clientWidth: 300,
      scrollHeight: 800,
    });
    const activeElem = document.createElement('button');
    overlayScroll.appendChild(activeElem);

    root.appendChild(overlayScroll);
    document.body.appendChild(root);

    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: root,
    });
    defineScrollableElement(root, {
      clientHeight: 500,
      scrollHeight: 500,
    });
    activeElem.focus();

    loadScrollModule();

    Scroll.scroll('down', 1);

    expect(root.scrollTop).toBe(0);
    expect(overlayScroll.scrollTop).toBe(60);
  });
});
