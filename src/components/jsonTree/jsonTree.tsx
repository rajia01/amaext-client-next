import { jsonToTableHtmlString } from 'json-table-converter';
import React from 'react';


function getKeyColor(level: number): string {
  const colors = ["#e53e3e", "#718096", "#ecc94b", "#48bb78", "#6b46c1"];
  return colors[level % colors.length];
}

function processJsonWithColors(json: any, level = 0): any {
  if (typeof json !== 'object' || json === null) return json;

  if (Array.isArray(json)) {
    return json.map((item) => processJsonWithColors(item, level));
  }

  return Object.fromEntries(
    Object.entries(json).map(([key, value]) => {
      console.log(key);
      const transformedValue =
        key.includes("[Next Step]") 
          ? `${value}&nbsp;&nbsp; ==> NEXT PROCESS`
          : processJsonWithColors(value, level + 1);

      return [
        `<span style="color: ${getKeyColor(level)};">${key.toLocaleUpperCase()}</span>`,
        transformedValue,
      ];
    })
  );
}

export default function JsonToTable({ json }: { json: any }) {
  const coloredJson = processJsonWithColors(json);

  const tableHtml = jsonToTableHtmlString(coloredJson, {
    tableStyle: "border-collapse: collapse; width: 100%;",
    trStyle:
      "border: 1px solid white; background-color: #0B1437; vertical-align: top;",
    thStyle:
      "border: 1px solid white;font-weight: bold; color: white; font-size: 16px; padding: 10px; text-align: left; background-color: #0B1437;",
    tdStyle:
      "border: 1px solid white;font-weight: bold; color: white; font-size: 16px; padding: 10px; text-align: left; background-color: #0B1437;",
    formatCell: (cellValue) =>
      typeof cellValue === "number" ? cellValue.toFixed(2) : cellValue,
  });

  return (
    <div
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        overflowX: "auto",
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: tableHtml }} />
    </div>
  );
}
