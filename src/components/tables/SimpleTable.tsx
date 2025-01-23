"use client";

import {
  TableContainer,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export function showTable(data: any[]) {
  return (
    <TableContainer>
    <Table variant="simple" size={"sm"}>
      <TableCaption color={"black.900"}>Column Details</TableCaption>
      <Thead>
        <Tr>
          {
            data?.length > 0 &&
          Object.keys(data[0] || {}).map((key) => (
            <Th key={key} color={"black.900"}>
              {key}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data?.map((row, rowIndex) => (
          <Tr key={rowIndex}>
            {Object.entries(row).map(([key, value], colIndex) => (
              <Td key={colIndex}>
                {key === "type"
                  ? value.toString() === "INTEGER"
                    ? "int"
                    : "char"
                  : String(value)}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
  
  );
}
