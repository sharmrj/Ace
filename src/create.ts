
export const createJoinBox = (position: Vector): Box => {
  return {
    position,
    alias: '',
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

export const createTableBox = (position: Vector): Box => {
  return {
    position,
    alias: '',
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

export const createUnionBox = (position: Vector): Box => {
  return {
    position,
    alias: '',
    out: null,
    element: null,
    lines: [],
    leftIn: null,
    rightIn: null
  };
};

export const createInnerQueryBox = (position: Vector): Box => {
  return {
    position,
    alias: '',
    in: null,
    out: null,
    element: null,
    lines: [],
    extra: {
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
      }
    }
  }
};
