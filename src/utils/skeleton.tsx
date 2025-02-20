import {
  Card,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Td,
  Tr,
} from '@chakra-ui/react';

export const getSkeleton = (rows: number, column: number) => (
  <Tr>
    <Td colSpan={column}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height="40px" mb={2} rounded="md" w="100%" />
      ))}
    </Td>
  </Tr>
);

export const LoadingSkeletonGrid = () => (
  <SimpleGrid
    columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
    minChildWidth="370px"
    spacing={6}
    justifyContent="center"
    alignItems="stretch"
    display="grid"
    mt="20px"
    gridTemplateColumns="repeat(auto-fit, minmax(370px, 1fr))"
    marginX="20px"
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <Card
        key={index}
        w="370px"
        h="320px"
        p={4}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Skeleton height="40px" mb={4} />
        <SkeletonText mt="4" noOfLines={4} spacing="4" />
      </Card>
    ))}
  </SimpleGrid>
);
