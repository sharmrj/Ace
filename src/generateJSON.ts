import { boxKind } from './main.ts';

export const generateJSON = (boxes: Box[]): Query => {
  if(boxes.length === 0) return {};
  if(!boxes[0]) return {};
  const root = findRoot(boxes[0]);
  return {
    fetch: {
      ...getJSON(root)
    }
  }
};

const getJSON = (box: Box): Table | Join | Union | InnerQuery  => {
  if(!box) return null;
  const kind = boxKind(box);
  switch(kind) {
    case 'Table':
      return tableJSON(box);
    case 'Inner Query':
      return innerQueryJSON(box);
    case 'Join':
      return joinJSON(box);
    case 'Union':
      return unionJSON(box);

  }
}

const findRoot = (box: Box): Box => {
  if (box.out) return findRoot(box.out);
  return box;
};

const tableJSON = (box: TableBox): Table => ({
  table: box.table
});

const joinJSON = (box: JoinBox): Join => ({
  join: {
    select_columns: box.select_columns,
    left_tbl: {
      fetch:{
        alias: box.alias,
        ...getJSON(box.leftIn)
      }
    },
    right_tbl: {
      fetch:{
        alias: box.alias,
        ...getJSON(box.rightIn)
      }
    },
    merge_strategy: box.merge_strategy
  }
});

const unionJSON = (box: UnionBox): Union => ({
  union: {
    left_tbl: {
      fetch:{
        alias: box.alias,
        ...getJSON(box.leftIn)
      }
    },
    right_tbl: {
      fetch:{
        alias: box.alias,
        ...getJSON(box.rightIn)
      }
    }
  }
})

const innerQueryJSON = (box: InnerQueryBox): InnerQuery => ({
  inner_query: {
    fetch: { 
      alias: box.alias, 
      select_columns: box.extra.select_columns,
      functions: box.extra.functions,
      where_clause: box.extra.where_clause,
      ...getJSON(box.in),
    }
  }
});


