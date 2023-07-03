import './style.css';
import './box.css';

let n = 0;

const vectorSubtract = (v1: Vector, v2: Vector): Vector => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y
});

const vectorAdd = (v1: Vector, v2: Vector): Vector => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y
});

const setPosition = (el: HTMLElement, pos: Vector): void => {
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
};


const makeDraggable = (box: Box): void => {
  const el = box.element;
  let dragging = false;
  let initialPos: Vector;
  let offset: Vector;
  const mePos = (e: Events.MouseEvent): Vector => ({ x: e.pageX, y: e.pageY});

  const startDragging = (event: Events.MouseEvent) => {
    dragging = true;
    initialPos = mePos(event);
    const bc = el.getBoundingClientRect();
    const boxPos = { x: bc.left, y: bc.top };
    offset = vectorSubtract(boxPos, initialPos);
  };

  const move = (event: Events.MouseEvent) => {
    if (dragging) {
      const movement = 
        vectorSubtract(mePos(event), initialPos);
      el.style.transform = `translate(${movement.x}px, ${movement.y}px)`;
      box.lines.map(line => line.position());
    }
  }
  const stopDragging = (event: events.MouseEvent) => { 
    if (dragging) {
      dragging = false;
      setPosition(el, vectorAdd(mePos(event), offset));
      el.style.transform = '';
    }
  }
  el.addEventListener('mousedown', startDragging);
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseup', stopDragging);
  el.addEventListener('mouseout', stopDragging);
};

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

const initBoxes = (boxList: Box[]) => {
  let from: HTMLElement;
  let to: HTMLElement;
  boxList.map(box => {
    const el = createElement(box);
    el.addEventListener("click", (event: Event.MouseEvent) => {
      if(event.shiftKey) {
        if (!from) {
          from = el;
        } else {
          to = el;
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
            from = null;
            to = null;
          }
        }
      }
    });
    document.body.append(el);
  });
}

const createJoinBox = (position: Vector): Box  => {
  return {
    position,
    out: null,
    element: null,
    lines: [],
    leftIn: null,
    rightIn: null,
    select_columns: [],
    merge_strategy: {
      type: '',
      conditions: {
        c0: {
          name: '',
          operator: '',
          value: ''
        }
      }
    }
  };
};

const createTableBox = (position: Vector): Box => {
  return {
    position,
    out: null,
    element: null,
    lines: [],
    table: {
      name: '',
      functions: [],
      select_columns: [],
      where_clause: {
        c0: {
          name: '',
          operator: '',
          value: '',
        },
        And: {
          c0: {
            name: '',
            operator: '',
            value: '',
          }
        }
      },
    }
  };
};

const createUnionBox = (position: Vector): Box => {
  return {
    position,
    out: null,
    element: null,
    lines: [],
    leftIn: null,
    rightIn: null
  };
};

const createInnerQueryBox = (position: Vector): Box => {
  return {
    position,
    in: null,
    out: null,
    element: null,
    lines: []
  }
};



const box1 = createInnerQueryBox({ x: 400, y: 400});
const box2 = createInnerQueryBox({ x: 700, y: 400});
const box3 = createInnerQueryBox({ x: 1000, y: 400});

const boxes = [box1, box2, box3]

initBoxes(boxes);


