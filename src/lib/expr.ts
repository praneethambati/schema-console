// Safe-ish expression evaluator; returns undefined on any error
export const evalExpr = (expr: string, values: any) => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("values", `"use strict"; return (${expr})`);
      return fn(values ?? {});
    } catch {
      return undefined;
    }
  };
  
  export const isVisible = (expr?: string, values?: any) =>
    !expr ? true : !!evalExpr(expr, values);
  