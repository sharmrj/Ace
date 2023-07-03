import './style.css';
import './box.css';

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


const makeDraggable = (el: HTMLElement): void => {
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

const createElement = (position: Vector): HTMLElement => {
  const el = document.createElement('div');
  el.classList.add('box');
  el.style.position = "absolute";
  setPosition(el, position);
  makeDraggable(el);
  return el;
}

const createJoinBox = (position: Vector): Box  => {

};

const createTableBox = (position: Vector): Box => {

};

const createUnionBox = (position: Vector): Box => {

};

const createInnerQueryBox = (position: Vector): Box => {

};

const addArrow = (target: Box, input: Box): Boolean => {

}

document.body.append(createElement({ x: 400, y: 400}));
document.body.append(createElement({ x: 500, y: 400}));
