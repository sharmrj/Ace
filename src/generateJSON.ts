import { boxKind, getPayload } from './main.ts';

export const generateJSON = (boxes: Box[]): Query => {
  if(boxes.length === 0) return {};
  if(!boxes[0]) return {};
  const root = findRoot(boxes[0]);
  return {
    fetch: {
      ...getJSON(root)
    },
    ...getPayload(),
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
  alias: box.alias,
  table: box.table
});

const joinJSON = (box: JoinBox): Join => ({
  alias: box.alias,
  join: {
    select_columns: box.select_columns,
    left_tbl: {
      fetch:{
        ...getJSON(box.leftIn)
      }
    },
    right_tbl: {
      fetch:{
        ...getJSON(box.rightIn)
      }
    },
    merge_strategy: box.merge_strategy
  }
});

const unionJSON = (box: UnionBox): Union => ({
  alias: box.alias,
  union: {
    left_tbl: {
      fetch:{
        ...getJSON(box.leftIn)
      }
    },
    right_tbl: {
      fetch:{
        ...getJSON(box.rightIn)
      }
    }
  }
})

const innerQueryJSON = (box: InnerQueryBox): InnerQuery => ({
  alias: box.alias,
  inner_query: {
    fetch: { 
      ...getJSON(box.in),
    },
    select_columns: box.extra.select_columns,
    functions: box.extra.functions,
    where_clause: box.extra.where_clause,
  }
});


