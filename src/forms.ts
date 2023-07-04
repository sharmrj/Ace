import { boxKind } from './main.ts'; 

export const configure = (box: Box): void => {
  const kind = box.element.textContent;
  const conf = document.createElement('div');
  conf.classList.add('configure');
  const header = document.createElement('div');
  header.classList.add('header');
  const title = document.createElement('div');
  title.textContent = `Configure ${kind}`;
  title.classList.add('title')
  const closeButton = document.createElement('div');
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', () => {
    conf.remove();
  })
  closeButton.textContent = 'close';
  header.replaceChildren(title, closeButton)
  conf.append(header);
  const getConfigurer = () => {
    const kind = boxKind(box);
    switch(kind) {
      case 'Table':
        return configureTable(box);
      case 'Inner Query':
        return configureInnerQuery(box);
      case 'Join':
        return configureJoin(box);
      case 'Union':
        return configureUnion(box);
    }
  }
  const xs = getConfigurer();
  xs.map(x => conf.append(x));
  document.body.append(conf);
}

const configureInnerQuery = (box: Box): HTMLElement[] => {
  const alias = textInput(box, 'alias', 'Alias');
  return alias;
};

const configureJoin = (box: Box): HTMLElement[] => {
  const alias = textInput(box, 'alias', 'Alias');
  const select = multiTextInput(box, 'select_columns', 'Select Columns');
  const merge = mergeStrategy(box, 'Merge Strategy');
  return [...alias, ...select, ...merge];
};

const configureUnion = (box: Box): HTMLElement[] => {
  const alias = textInput(box, 'alias', 'Alias');
  return alias; 
};

const configureTable = (box: Box): HTMLElement[] => {
  const [aLabel, alias] = textInput(box, 'alias', 'Alias');
  const [nLabel, name] = textInput(box, 'table.name', 'Name');
  const [fLabel, functions] = multiTextInput(box, 'table.functions', 'Functions');
  const [sLabel, select] = multiTextInput(box, 'table.select_columns', 'Select Columns');
  const w = where(box, 'table', 'Where Clause')
  
  return [aLabel, alias, nLabel, name , fLabel, functions, sLabel, select, ...w];
};

const mergeStrategy = (box: Box, title: String): HTMLElement[] => {
  const t = document.createElement('div');
  t.textContent = title;
  t.style.fontWeight = 800;
  t.style.textDecoration = 'underline';
  const type = textInput(box, `merge_strategy.type`, 'Type');
  const con = condition(box, `merge_strategy.conditions`, 'Condition');
  return [t, ...type, ...con];
};

const where = (box: Box, path: String, title: String): HTMLElement[] => {
  const t = document.createElement('div');
  t.textContent = title;
  t.style.fontWeight = 800;
  t.style.textDecoration = 'underline';
  const c0 = condition(box, `${path}.where_clause`, 'Condition 1');
  const f = document.createElement('fieldset')
  const and = document.createElement('input');
  and.type = 'radio';
  and.value = 'And';
  and.name = 'cond';
  and.checked = true;
  const aLabel = document.createElement('label');
  aLabel.textContent = and.value;
  aLabel.for = and.value;
  const or = document.createElement('input');
  or.type = 'radio';
  or.value = 'Or';
  or.name = 'cond';
  const oLabel = document.createElement('label');
  oLabel.textContent = or.value;
  oLabel.for = or.value;
  f.replaceChildren(and, aLabel, or, oLabel);
  and.addEventListener('change', (event) => {
    if (event.target.checked) {
      const oldC0 = deepGet(box, `${path}.where_clause.c0`)
      const oldOr = deepGet(box, `${path}.where_clause.Or`)
      deepSet(box, `${path}.where_clause`, {c0: oldC0, And: oldOr});
    }
  });
  or.addEventListener('change', (event) => {
    if (event.target.checked) { 
      const oldC0 = deepGet(box, `${path}.where_clause.c0`)
      const oldAnd = deepGet(box, `${path}.where_clause.And`)
      deepSet(box, `${path}.where_clause`, {c0: oldC0, Or: oldAnd});
    }
  });
  const c1 = condition(box, `${path}.where_clause.${and.checked ? 'And':'Or'}`, 'Condition 2');
    
  return [t,...c0,f, ...c1 ];
};

const condition = (box: Box, path: String, title: String): HTMLElement[] => {
  const p = `${path}.c0`
  const t = document.createElement('div');
  t.textContent = title;
  t.style.textDecoration = 'underline';
  const name = textInput(box, `${p}.name`, 'name');
  const operator = textInput(box, `${p}.operator`, 'operator');
  const value = textInput(box, `${p}.value`, 'value');
  return [t, ...name, ...operator, ...value];
}

const textInput = (box: Box, path: String, name: String): HTMLElement[] => {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = name;
  const label = document.createElement('label');
  label.for = name;
  label.textContent = name;
  input.value = deepGet(box, path);
  input.addEventListener('change', (event) => {
    deepSet(box, path, event.target.value);
  });
  return [label, input];
};

const multiTextInput = (box: Box, path: String, name: String): HTMLElement[] => {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = name;
  const label = document.createElement('label');
  label.for = name;
  label.textContent = name;
  input.value = deepGet(box, path).join(', ');
  input.addEventListener('change', (event) => {
    deepSet(box, path, event.target.value.split(',').map(x => x.trim()));
  });
  return [label, input];
};

const deepGet = (obj, path) =>
  path.split('.').reduce((acc, x) => {
    return acc?.[x];
  }, obj);

const deepSet = (obj, path, newValue) => {
  const properties = path.split('.');
  let currentObject = obj;
  let property;

  while (properties.length) {
    property = properties.shift()
    
    if (!currentObject) break;
    
    if (!isObject(currentObject[property])) {
      currentObject[property] = {}
    }

    if (!properties.length){
      currentObject[property] = newValue
    }
    currentObject = currentObject[property]
  }

  return obj;
}

const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null
}
