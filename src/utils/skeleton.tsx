import { Skeleton, Td, Tr } from '@chakra-ui/react';

export const getSkeleton = (count: number) => (
  <Tr>
    <Td colSpan={5}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height="53px" mb={2} rounded="md" w="100%" />
      ))}
    </Td>
  </Tr>
);

export const getDBRecordSkeleton = (count: number) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Tr key={i}>
        <Td>
          <Skeleton height="20px" mb={2} rounded="md" />
        </Td>
        <Td>
          <Skeleton height="20px" mb={2} rounded="md" />
        </Td>
      </Tr>
    ))}
  </>
);
