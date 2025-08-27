export type BaseNode = {
    id: string;
    type: "text" | "number" | "select" | "checkbox" | "section";
    label: string;
    required?: boolean;
    visibleIf?: string; // JS expression against values (e.g., values.age > 18)
    compute?: string;   // JS expression to compute value (e.g., values.a + values.b)
  };
  
  export type TextNode = BaseNode & {
    type: "text";
    placeholder?: string;
    regex?: string;
  };
  export type NumberNode = BaseNode & {
    type: "number";
    min?: number;
    max?: number;
  };
  export type SelectNode = BaseNode & {
    type: "select";
    options?: string[];
    regex?: string;
  };
  export type CheckboxNode = BaseNode & {
    type: "checkbox";
  };
  export type SectionNode = BaseNode & {
    type: "section";
    children: AnyNode[];
  };
  
  export type AnyNode = TextNode | NumberNode | SelectNode | CheckboxNode | SectionNode;
  