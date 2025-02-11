'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useColorMode,
  Card,
  CardHeader,
  Heading,
  Badge,
  Tooltip,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableCaption,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ColumnCount from './ColumnCount';
import { fetchBackendData } from 'utils/api/report';
import { GrTooltip } from 'react-icons/gr';


// ============================== Table Names ==============================
const seller_table = 'amazon_seller_5lakh';
const product_details = 'ddmapp_amazonproductdetailsnew_data_1028';
const product_list = 'ddmapp_amazonproductlist_data_1028';

const tableName: string = seller_table;

// ============================ Table Component ============================
function showTable(columns: { column_name: string; null_count: number }[]) {
  const { colorMode } = useColorMode();
  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <TableCaption color="black.900">Column Details</TableCaption>
        <Thead>
          <Tr>
            <Th sx={{ color: colorMode === 'light' ? 'white' : 'black' }}>Column</Th>
            <Th sx={{ color: colorMode === 'light' ? 'white' : 'black' }}>Null Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {columns?.map((column, index) => (
            <Tr key={index}>
              <Td color="black.900">{column.column_name}</Td>
              <Td textAlign="right">{column.null_count ? `${column.null_count}` : 'No null'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

// ============================= Page Component =============================
const Page: React.FC = () => {
  const { colorMode } = useColorMode();
  const [taskId, setTaskId] = useState<number | null>(null);
  const taskIdInputRef = useRef<HTMLInputElement>(null);
  const columnCountRef = useRef<HTMLDivElement>(null);
  const [showColumnCount, setShowColumnCount] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<{ column_name: string; null_count: number }[] | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);


  const [allComments, setAllComments] = useState<{ id: string; comment: string }[]>([
    { id: "bucket1", comment: "This is a sample comment" },
    { id: "bucket1", comment: "Another comment for bucket1" },
    { id: "bucket2", comment: "Feedback for bucket2" }
  ]);

  // Fetch backend data when taskId is set
  const { data, isLoading, error } = useQuery({
    queryKey: ['backendData', tableName, taskId],
    queryFn: () => fetchBackendData(tableName, taskId),
    enabled: !!tableName && !!taskId, // Fetch only when both are available
  });


  const handleTaskIdKeyPress = () => {
    const inputValue = taskIdInputRef.current?.value;
    const newTaskId = Number(inputValue);
    if (!isNaN(newTaskId) && newTaskId !== taskId) {
      setTaskId(newTaskId);
      setShowColumnCount(false);
    }
  };

  const handleCardClick = (bucketName: string, columns: { column_name: string; null_count: number }[]) => {
    setSelectedColumns(columns);
    setSelectedBucket(bucketName);
    setShowColumnCount(true);
    setTimeout(() => {
      columnCountRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };


  return (
    <Box p={6}>
      {/* Table Name Display */}
      <Box mb={6}>
        <Heading
          size="lg"
          fontWeight="bold"
          display="inline-block"
          borderBottom="2px solid"
          borderColor={colorMode === 'light' ? 'gray.600' : 'gray.400'}
          pb={1}
        >
          {(() => {
            switch (tableName) {
              case seller_table:
                return 'Amazon Seller Table';
              case product_details:
                return 'Amazon Product Details';
              case product_list:
                return 'Amazon Product List';
              default:
                return 'Unknown Table';
            }
          })()}
        </Heading>
      </Box>

      {/* Task ID Input */}
      <Box mb={8}>
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="bold" color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            Task ID
          </FormLabel>
          <Box display="flex" gap={4}>
            <Input
              ref={taskIdInputRef}
              placeholder="Enter Task ID"
              size="lg"
              width="350px"
              variant="outline"
              backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
              color={colorMode === 'light' ? 'black' : 'white'}
              border="1px solid"
              borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
              _focus={{ borderColor: 'blue.500', boxShadow: '0px 0px 8px rgba(0, 120, 255, 0.5)' }}
            />
            <Button onClick={handleTaskIdKeyPress} size="lg" colorScheme="blue">
              Set Task ID
            </Button>
          </Box>
        </FormControl>
      </Box>

      {/* Cluster Cards - Display only if Task ID is set */}
      {taskId ? (
        isLoading ? (
          <Box textAlign="center" fontSize="lg" fontWeight="bold" color="gray.500" mt={6}>
            Loading data...
          </Box>
        ) : error ? (
          <Box textAlign="center" fontSize="lg" fontWeight="bold" color="red.500" mt={6}>
            Error fetching data
          </Box>
        ) : (
          <SimpleGrid minChildWidth="300px" spacing={6} justifyContent="center">
            {data?.buckets &&
              Object.entries(data.buckets).map(([bucketName, { columns, accuracy, common_rows, unique_rows }]) => (
                <Card
                  key={bucketName}
                  w="300px"
                  h="auto"
                  p={5}
                  borderRadius="lg"
                  boxShadow="lg"
                  bg={colorMode === 'light' ? 'white' : 'gray.800'}
                  transition="transform 0.3s ease, box-shadow 0.3s ease"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0px 0px 15px rgba(0, 120, 255, 0.4)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCardClick(bucketName, columns)}
                >
                  <CardHeader pb={3} textAlign="center">
                    <Heading size="md" color="blue.600">
                      {bucketName}
                    </Heading>

                    <Tooltip label={showTable(columns)} placement="right" fontSize="md">
                      <Box position="absolute" top={2} right={2} fontSize="lg">
                        <FaInfoCircle />
                      </Box>
                    </Tooltip>

                    <TableContainer mt={3}>
                      <Table variant="simple" size="sm">
                        <Tbody>
                          <Tr>
                            <Td fontWeight="bold">Accuracy</Td>
                            <Td textAlign="right">
                              {typeof accuracy === "number" ? accuracy.toFixed(2) : accuracy}
                            </Td>
                          </Tr>
                          <Tr>
                            <Td fontWeight="bold">Columns</Td>
                            <Td textAlign="right">{columns.length}</Td>
                          </Tr>
                          <Tr>
                            <Td fontWeight="bold">Common Rows</Td>
                            <Td textAlign="right">{common_rows ?? "N/A"}</Td>
                          </Tr>
                          <Tr>
                            <Td fontWeight="bold">Unique Rows</Td>
                            <Td textAlign="right">{unique_rows ?? "N/A"}</Td>
                          </Tr>
                          <Tr>
                            <Td fontWeight="bold">Comments</Td>
                            <Td textAlign="right">

                              <Box display="flex" alignItems="center" gap="6px">
                                {/* Comment Count */}
                                <Box
                                  display="inline-flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  px="0.4rem"
                                  py="0.1rem"
                                  border="1px solid #ccc"
                                  borderRadius="4px"
                                  fontSize="0.9rem"
                                  fontWeight="bold"
                                  backgroundColor="gray.100"
                                  color="black"
                                  minWidth="24px"
                                  textAlign="center"
                                >
                                  {allComments?.filter((eachComment) => eachComment.id === bucketName).length || 0}
                                </Box>

                                {/* Comment Popover */}
                                <Popover trigger="hover" placement="top">
                                  <PopoverTrigger>
                                    <button>
                                      <GrTooltip
                                        style={{
                                          fontSize: '1.8rem',
                                          cursor: 'pointer',
                                          color: '#007bff',
                                        }}
                                      />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverBody
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          allComments?.filter((eachComment) => eachComment.id === bucketName).length > 0
                                            ? allComments
                                              .filter((eachComment) => eachComment.id === bucketName)
                                              .map((eachComment, index) => `${index + 1}. ${eachComment.comment}`)
                                              .join('<br />')
                                            : 'No comments available',
                                      }}
                                      style={{ textAlign: "center", zIndex: "10" }}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </Box>

                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </TableContainer>



                  </CardHeader>
                </Card>
              ))}
          </SimpleGrid>

        )
      ) : (
        <Box textAlign="center" fontSize="lg" fontWeight="bold" color="gray.500" mt={6}>
          Enter a Task ID to display clusters
        </Box>
      )}

      {/* Display ColumnCount if Task ID is set */}
      {showColumnCount && taskId && selectedColumns && (
        <Box ref={columnCountRef} mt={10}>
          <ColumnCount
            taskId={taskId}
            tableName={tableName}
            selectedColumns={selectedColumns}
            selectedBucket={selectedBucket}
          />

        </Box>
      )}

    </Box>
  );
};

export default Page;

