import { Card, Heading, Box, Text } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

const InfoCard: React.FC = () => {
  const { colorMode } = useColorMode();

  return (
    <Card
      position="absolute"
      top="20%"
      right="4.5%"
      w="fit-content"
      p={4}
      borderRadius="lg"
      boxShadow="lg"
      bg={colorMode === 'light' ? 'blue.50' : 'gray.700'}
      border="2px solid"
      borderColor={colorMode === 'light' ? 'blue.300' : 'blue.500'}
    >
      <Heading size="md" color="blue.600" textAlign="left" my={1}>
        Column Inter-Dependency Values
      </Heading>
      <Box>
        <Text
          fontSize="sm"
          color={colorMode === 'light' ? 'gray.700' : 'gray.300'}
        >
          <strong>Full:</strong> All columns contain complete data.
          <br />
          <strong>Empty:</strong> Whole column is empty.
          <br />
          <strong>NaN:</strong> No correlation between the column`s data.
        </Text>
      </Box>
    </Card>
  );
};

export default InfoCard;
