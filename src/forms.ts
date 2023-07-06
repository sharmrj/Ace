import { boxKind, getPayload, getBoxes } from './main.ts'; 
import { generateJSON } from './generateJSON.ts';


export const configure = (box: Box | any, notBox = false): void => {
  const conf = document.createElement('div');
  conf.classList.add('configure');
  const kind = box?.element?.textContent ?? 'Final Table';
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
    if (notBox) return configureFinal(getPayload());
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

const configureFinal = (payload) => {
  const name = textInput(payload, 'final_table_name', 'Final Table Name');
  const pc = multiTextInput(payload, 'partition_columns', 'Partition Columns');
  const num = document.createElement('input');
  num.type = 'text';
  num.name = 'Number of files in partition';
  const label = document.createElement('label');
  label.for = num.name;
  label.textContent = num.name;
  num.value = deepGet(payload, 'number_of_files_in_partition');
  num.addEventListener('change', (event) => {
    deepSet(payload, 'number_of_files_in_partition', event.target.value);
  });

  const sendButton = document.createElement('button');
  sendButton.textContent = 'Send';
  sendButton.addEventListener('click', () => {
    fetch('/url/goes/here', {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'omit',
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(generateJSON(getBoxes())),
    }).catch(e => console.error(e)).finally(document.querySelector('.configure').remove());
  })

  return [...name, ...pc, label, num, sendButton];
};

const configureInnerQuery = (box: Box): HTMLElement[] => {
  const alias = textInput(box, 'alias', 'Alias');
  const fs = functions(box, 'extra.functions', 'Functions');
  const select = multiTextInput(box, 'extra.select_columns', 'Select Columns');
  const w = where(box, 'extra', 'Where Clause');
  return [...alias, ...select, ...w, ...fs];
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
  const fs = functions(box, 'table.functions', 'Functions');
  const [sLabel, select] = multiTextInput(box, 'table.select_columns', 'Select Columns');
  const w = where(box, 'table', 'Where Clause')
  
  return [aLabel, alias, nLabel, name , sLabel, select, ...w, ...fs];
};

const functions = (box: Box, path: String, title: String): HTMLElement[] => {
  const t = document.createElement('div');
  t.textContent = title;
  t.style.fontWeight = 800;
  t.style.textDecoration = 'underline';
  const f = {
    case: {
      when: [],
      otherwise: [],
      alias: ''
    }
  }
  const when = multiTextInput(f, 'case.when', 'When');
  const otherwise = textInput(f, 'case.otherwise', 'Otherwise');
  const alias = textInput(f, 'case.alias', 'Alias');
  const fcontainer = document.createElement('div');
  fcontainer.style.marginTop = '12px';
  fcontainer.style.marginBottom = '12px';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Function';
  addButton.addEventListener('click', () => {
    const cf = deepGet(box, path)
    cf.push(structuredClone(f));
    deepSet(box, path, cf);
    renderList(box, path, fcontainer, cf.map(func => func.case.alias));

    when[1].value = [];
    otherwise[1].value = [];
    alias[1].value = '';
    f.case = {
      when:[],
      otherwise: [],
      alias: ''
    }
  });
  return [t, ...when, ...otherwise, ...alias, addButton, fcontainer];
};

const renderList = (box: Box, path: String, container: HTMLElement, names: String[]) => {
  container.replaceChildren(...names.map(name => {
    const element = document.createElement('span');
    element.textContent = name;
    element.addEventListener('mouseenter', () => {
      element.textContent = `${element.textContent} x`;
    });
    element.addEventListener('mouseleave', () => {
      element.textContent = element.textContent.slice(0, -2);
    });
    element.addEventListener('click', () => {
      const fs = deepGet(box, path);
      const ffs = fs.filter(x => x.case.alias !== name)
      deepSet(box, path, ffs);
      element.remove();
    });
    return element;
  }));
}

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
