import './style.css';
import './box.css';
import './menu.css';
import { 
  createJoinBox,
  createTableBox,
  createUnionBox,
  createInnerQueryBox
  } from './create.ts'
import { makeDraggable, setPosition } from './drag.ts';
import { generateJSON } from './generateJSON.ts';
import { configure } from './forms.ts';

let n = 0;

const createElement = (box: Box): HTMLElement => {
  const position = box.position;
  const el = document.createElement('div');
  box.element = el;
  el.classList.add('box');
  el.style.position = "absolute";
  el.setAttribute('data-id', `${n++}`)
  setPosition(el, position);
  makeDraggable(box);
  return el;
}

const getBox = (id) => boxes.find(box => box.element.dataset.id === id);

const initBox  = (box: Box) => initBoxes([box]);

let from: HTMLElement | null;
let to: HTMLElement | null;

const deselectAll = () => {
  from?.classList.remove('selected');
  from = null;
  to?.classList.remove('selected');
  to = null;
};

document.body.addEventListener('click', deselectAll);

const initBoxes = (boxList: Box[]) => {
  boxList.map(box => {
    const el = createElement(box);
    el.addEventListener("click", (event: Event.MouseEvent) => {
      if(event.shiftKey) {
        event.stopPropagation();
        if (!from) {
          from = el;
          from.classList.add('selected');
        } else {
          to = el;
          to.classList.add('selected');
        }
        if (from && to) {
          const drawLine = () => {
            const line = new LeaderLine(from, to, { hide: true });
            line.show('draw', {duration: 77, timing: 'linear' });
            toBox.lines.push(line);
            fromBox.lines.push(line);
          }
          const fromBox = getBox(from.dataset.id);
          const toBox = getBox(to.dataset.id);
          if (!fromBox.out) {
            fromBox.out = toBox;
            if (toBox.hasOwnProperty('in') && !toBox.in) {
              toBox.in = fromBox;
              drawLine();
            }
            if (toBox.hasOwnProperty('leftIn') && !toBox.leftIn) {
              toBox.leftIn = fromBox;
              drawLine();
            } else if (toBox.hasOwnProperty('rightIn') && !toBox.rightIn) {
              toBox.rightIn = fromBox;
              drawLine();
            }
          }
          deselectAll();
          console.info(boxes);
        }
      }
    });
    el.textContent = boxKind(box);
    el.addEventListener('click', (event: Events.MouseEvent) => {
      if (!event.altKey) return;
      event.stopPropagation();
      configure(box);
    });
    document.body.append(el);
  });
}

export const boxKind = (box: Box[]): String => {
  if (box.hasOwnProperty('table')) return 'Table';
  if (box.hasOwnProperty('in')) return 'Inner Query';
  if (box.hasOwnProperty('leftIn')
  && box.hasOwnProperty('rightIn')
  && box.hasOwnProperty('merge_strategy')) return 'Join';
  return 'Union';
}

const initMenu = () => {
  const menu = document.querySelector('.menu');
  const addMenuItems = () => {
    const bs = [
      ['Join', createJoinBox], 
      ['Table', createTableBox],
      ['Union', createUnionBox],
      ['Inner Query', createInnerQueryBox]
    ];
    const menuItems = bs.map(([name, create]) => {
      const item = document.createElement('div');
      item.textContent = name;
      item.classList.add('menu-item');
      item.addEventListener('click', () => {
        const box = create({ x: 400, y: 400 });
        boxes.push(box)
        initBox(box);
      })
      return item;
    });
    menuItems.forEach(item => menu.appendChild(item));
  }
  menu.addEventListener('mouseenter', () => {
    menu.classList.add('show-menu');
  });
  menu.addEventListener('mouseleave', () => {
    menu.classList.remove('show-menu');
  });
  addMenuItems();
};

const boxes = [];

const generateButton = document.createElement('button');
generateButton.textContent = 'generate JSON';
generateButton.addEventListener('click', () => {
  console.info(generateJSON(boxes));
})
generateButton.style.position = 'absolute';
generateButton.style.right = '2%';
generateButton.style.top = '2%';
document.body.append(generateButton);

initMenu();
