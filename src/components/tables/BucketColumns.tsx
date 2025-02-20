import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface Column {
  column_name: string;
  null_count: number;
}

interface TableComponentProps {
  columns: Column[];
  Pivot_Columns: string[];
}

const BucketColumns: React.FC<TableComponentProps> = ({
  columns,
  Pivot_Columns,
}) => {
  const { colorMode } = useColorMode();

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th sx={{ color: colorMode === 'light' ? 'white' : 'black' }}>
              Column
            </Th>
            <Th sx={{ color: colorMode === 'light' ? 'white' : 'black' }}>
              Null Count
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {columns.map((column, index) => (
            <Tr key={index}>
              <Td
                color={
                  Pivot_Columns.includes(column.column_name)
                    ? 'red.500'
                    : colorMode === 'light'
                    ? 'white'
                    : 'black'
                }
              >
                {Pivot_Columns.includes(column.column_name) ? (
                  <Box as="span">{column.column_name}</Box>
                ) : (
                  column.column_name
                )}
              </Td>
              <Td textAlign="right">
                {column.null_count ? `${column.null_count}` : 'No null'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default BucketColumns;
