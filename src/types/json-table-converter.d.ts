declare module 'json-table-converter' {
    export function jsonToTableHtmlString(
      json: any,
      options?: {
        tableStyle?: string;
        trStyle?: string;
        thStyle?: string;
        tdStyle?: string;
        tdKeyStyle?: string;
        formatCell?: (cellValue: any, isKeyCell: boolean) => any;
      }
    ): string;
  }
  