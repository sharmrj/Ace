export type Query = {
  fetch: Fetch;
}

export type Fetch = FetchBase & (Join | Table | Union | InnerQuery);

type FetchBase = {
  alias?: String;
}

export type Join = {
  join: Select & LeftTable & RightTable & MergeStrategy;
}

export type Table = {
  table: Name & Functions & Select & Where
}

export type Union = {
  union: LeftTable & RightTable;
}

export type InnerQuery= {
  inner_query: Query;
} & Select & Functions & Where

export type Select = {
  select_columns: String[];
}
export type LeftTable = {
  left_tbl: Fetch | null;
}
export type RightTable = {
  right_tbl: Fetch | null;
}

export type Function = {
  case: {
    when: String[];
    otherwise: String[];
    alias?: String;
  }
}

export type Where = {
    where_clause: CZero & (And | Or) 
}

export type MergeStrategy = {
  merge_strategy: {
    type: String;
    conditions: {
      c0: Condition;
    }
  }
}

export type Condition = Name & Operator & Value;

type Operator = {
  operator: String;
}

type Value = {
  value: String;
}

type Functions = {
    functions: Function[];
}

type Name = {
  name: String;
}

type CZero = {
    c0: Condition;
  }

type And = {
    And: CZero;
}

type Or = {
    Or: CZero;
}

//==========================================================

export type Vector = {
  x: Number;
  y: Number;
}

type BaseBox = {
  position: Vector;
  out: Box | null
  element: HTMLElement | null;
  lines: Unknown[];
  alias?: String;
}

export type Box = BaseBox & (JoinBox | TableBox | UnionBox | InnerQueryBox)

export type JoinBox = {
  leftIn: Box | null;
  rightIn: Box | null; 
} & Select & MergeStrategy

export type TableBox = Table

export type UnionBox = {
  leftIn: Box | null;
  rightIn: Box | null; 
}

export type InnerQueryBox = Box & {
  in: Box | null;
  extra: Select & Functions & Where
}
