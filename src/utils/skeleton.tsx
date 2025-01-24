import { Skeleton, Td, Tr } from '@chakra-ui/react';

export const getSkeleton = (rows: number, column: number) => (
  <Tr>
    <Td colSpan={column}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height="53px" mb={2} rounded="md" w="100%" />
      ))}
    </Td>
  </Tr>
);
