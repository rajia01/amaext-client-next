'use client';

import {
  Box,
  Button,
  Card,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { MdDownload } from "react-icons/md";
import { FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { GrTooltip } from 'react-icons/gr';
import {
  fetchBucketData,
  fetchBucketComments,
} from 'utils/api/report';
import ShowBucketColumns from './ShowBucketColumns';

// Define the type for a column entry
type Column = {
  column_name: string;
  not_null_count: number;
  null_count: number;
};

// Define the type for a bucket
type Bucket = {
  columns: Column[];
  accuracy: number | string;
  common_rows: number;
  unique_rows: number;
  pivot_columns: string[];
};

// Define the response type for the backend data
type BackendDataResponse = {
  buckets: Record<string, Bucket>; // Object where keys are bucket names
  total_buckets: number;
  total_rows: number;
};

type BucketComment = {
  flag: string;
  text: string;
  [bucketName: string]: string; // Represents dynamic bucket names as keys
  'time-stamp': string;
};

type BucketCommentResponse = Record<
  string,
  {
    columns: string[];
    accuracy: number;
    final_flag: boolean;
    bucket_comments: BucketComment[];
    bucket_comment_count: number;
  }
>;

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
        <Thead>
          <Tr>
            <Th sx={{ color: colorMode === 'light' ? 'black' : 'white' }}>
              Column
            </Th>
            <Th sx={{ color: colorMode === 'light' ? 'black' : 'white' }}>
              Null Count
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {columns?.map((column, index) => (
            <Tr key={index}>
              <Td color="black.900">{column.column_name}</Td>
              <Td textAlign="right">
                {column.null_count ? `${column.null_count}` : 'No null'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

// ========================= Add the small card component at the top right =========================
const AccuracyInfoCard: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Card
      position="absolute"
      top="12%"
      right="4.5%"
      w="-moz-fit-content"
      p={4}
      borderRadius="lg"
      boxShadow="lg"
      bg={colorMode === 'light' ? 'blue.50' : 'gray.700'} // Different background
      border="2px solid"
      borderColor={colorMode === 'light' ? 'blue.300' : 'blue.500'} // Highlight border
    >
      <Heading size="md" color="blue.600" textAlign="left" marginY="1">
        Accuracy Values
      </Heading>
      <Box>
        <Text
          fontSize="sm"
          color={colorMode === 'light' ? 'gray.700' : 'gray.300'}
        >
          <strong>Full:</strong> All columns contain complete data.
          <br />
          <strong>Empty:</strong> Whole column is Empty.
          <br />
          <strong>NaN:</strong> No Correlation between the columns data.
        </Text>
      </Box>
    </Card>
  );
};

// ============================================= Page Component =============================================
const Page: React.FC = () => {
  const { colorMode } = useColorMode();
  const [taskId, setTaskId] = useState<number | null>(null);
  const taskIdInputRef = useRef<HTMLInputElement>(null);
  const columnCountRef = useRef<HTMLDivElement>(null);
  const [showBucketColumns, setShowBucketColumns] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<
    { column_name: string; null_count: number }[] | null
  >(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

  // Fetch bucket data when taskId is set
  const { data, isLoading, error } = useQuery<BackendDataResponse>({
    queryKey: ['backendData', tableName, taskId],
    queryFn: () =>
      fetchBucketData(tableName, taskId) as Promise<BackendDataResponse>,
    enabled: !!tableName && !!taskId, // Fetch only when both are available
  });

  // Fetch bucket comments when taskId is set
  const { data: bucketComment } = useQuery<BucketCommentResponse>({
    queryKey: ['bucketComments', tableName, taskId],
    queryFn: () =>
      fetchBucketComments(tableName, taskId),
    enabled: !!tableName && !!taskId, // Fetch only when both are available
  });

  const handleTaskIdKeyPress = () => {
    const inputValue = taskIdInputRef.current?.value;
    const newTaskId = Number(inputValue);
    if (!isNaN(newTaskId)) {
      setTaskId(newTaskId);
      setShowBucketColumns(false);
    }
  };

  const handleCardClick = (
    bucketName: string,
    columns: { column_name: string; null_count: number }[],
  ) => {
    setSelectedColumns(columns);
    setSelectedBucket(bucketName);
    setShowBucketColumns(true);
    setTimeout(() => {
      columnCountRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Card
        key={index}
        w="370px"
        h="auto"
        p={5}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Skeleton height="40px" mb={4} />
        <SkeletonText mt="4" noOfLines={4} spacing="4" />
      </Card>
    ));
  };

  const handleDownload = async (bucket: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/${tableName}/task_id/${taskId}/download-sample/${bucket}/`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Convert response to a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `sample_data_${tableName}_${taskId}_${bucket}.csv`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Box p={6}>
      {/* Accuracy Info Card */}
      <AccuracyInfoCard />

      {/* =================================== Table-Name =================================== */}
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

      {/* =================================== Task ID Input =================================== */}

      <Box mb={8}>
        <FormControl>
          <FormLabel
            fontSize="lg"
            fontWeight="bold"
            color={colorMode === 'light' ? 'gray.700' : 'gray.300'}
          >
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
              _focus={{
                borderColor: 'blue.500',
                boxShadow: '0px 0px 8px rgba(0, 120, 255, 0.5)',
              }}
            />
            <Button onClick={handleTaskIdKeyPress} size="lg" colorScheme="blue">
              Set Task ID
            </Button>
          </Box>
        </FormControl>
      </Box>

      {/* =================================== Cluster Cards =================================== */}

      {taskId ? (
        isLoading ? (
          <SimpleGrid minChildWidth="300px" spacing={5} justifyContent="center">
            {renderSkeletons()}
          </SimpleGrid>
        ) : error ? (
          <Box
            textAlign="center"
            fontSize="lg"
            fontWeight="bold"
            color="red.500"
            mt={6}
          >
            Error fetching data
          </Box>
        ) : (
          <SimpleGrid minChildWidth="300px" spacing={5} justifyContent="center">
            {data?.buckets &&
              Object.entries(data.buckets).map(
                ([bucketName, { columns, accuracy, common_rows, unique_rows }]) => {
                  // Extract comment counts and bucket comments
                  const commentCounts = bucketComment
                    ? Object.fromEntries(
                      Object.entries(bucketComment).map(([name, bucketData]) => [
                        name,
                        bucketData.bucket_comment_count || 0,
                      ])
                    )
                    : {};

                  const bucketComments = bucketComment
                    ? Object.fromEntries(
                      Object.entries(bucketComment).map(([name, bucketData]) => [
                        name,
                        bucketData.bucket_comments || [],
                      ])
                    )
                    : {};

                  return (
                    <Card
                      key={bucketName}
                      w="370px"
                      h="auto"
                      p={3}
                      borderRadius="lg"
                      boxShadow="lg"
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      transition="transform 0.3s ease, box-shadow 0.3s ease"
                      _hover={{
                        boxShadow: "0px 0px 15px rgba(0, 120, 255, 0.4)",
                        cursor: "pointer",
                      }}
                      onClick={() => handleCardClick(bucketName, columns)}
                    >
                      <CardHeader pb={3} textAlign="center">



                        <Heading size="md" color="blue.600" display="inline-flex" alignItems="center">
                          {bucketName}
                          {accuracy === 'Full' && (
                            <FaCheckCircle color="light green" style={{ marginLeft: '5px' }} />
                          )}
                        </Heading>

                        <Box position="absolute" top={2} right={2} fontSize="lg" cursor="pointer">
                          <Box onClick={(event) => event.stopPropagation()}> {/* Prevents card click */}
                            <Popover>
                              <PopoverTrigger>
                                <FaInfoCircle />
                              </PopoverTrigger>
                              <PopoverContent
                                maxH="300px"
                                overflowY="auto" // Enables vertical scrolling
                                overflowX="hidden" // Disables horizontal scrolling
                                boxShadow="lg"
                                borderRadius="md"
                                p={3}
                                onClick={(event) => event.stopPropagation()} // Prevents card click event
                                width="fit-content" // Ensures it only takes necessary width
                                minW="200px" // Prevents it from shrinking too much
                              >
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody whiteSpace="nowrap"> {/* Prevents unnecessary text wrapping */}
                                  {showTable(columns)}
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                          </Box>
                        </Box>


                        <TableContainer mt={3}>
                          <Table variant="simple" size="sm">
                            <Tbody>
                              <Tr>
                                <Td fontWeight="bold">Column Inter-Dependency</Td>
                                <Td textAlign="right">
                                  {typeof accuracy === "number" ? accuracy.toFixed(2) : accuracy}
                                </Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Columns</Td>
                                <Td textAlign="right">{columns.length}</Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Common Null Count</Td>
                                <Td textAlign="right">{common_rows ?? "N/A"}</Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Uncommon Null Count</Td>
                                <Td textAlign="right">{unique_rows != null && common_rows != null ? unique_rows - common_rows : "N/A"}</Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Comments</Td>
                                <Td textAlign="right">
                                  <Box display="flex" gap="10px" justifyContent="end">
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
                                      {commentCounts?.[bucketName] || 0}
                                    </Box>

                                    <Popover trigger="click" placement="top">
                                      <PopoverTrigger>
                                        <Box
                                          as="button"
                                          onClick={(event) => event.stopPropagation()} // Prevents card click
                                        >
                                          <GrTooltip
                                            style={{
                                              fontSize: "1.5rem",
                                              cursor: "pointer",
                                              color: "#007bff",
                                            }}
                                          />
                                        </Box>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        onClick={(event) => event.stopPropagation()}
                                        bg="gray.100"
                                        boxShadow="lg"
                                        borderRadius="md"
                                        p={3}
                                        maxH="400px" // Set max height
                                        overflowY="auto" // Enable vertical scrolling
                                      >

                                        <PopoverCloseButton color="black" />
                                        <PopoverBody textAlign="left">
                                          {bucketComments?.[bucketName]?.length > 0 ? (
                                            <Box display="flex" flexDirection="column" gap={2}>
                                              {bucketComments[bucketName].map((comment, index) => (
                                                <Box key={index} fontSize="sm" color="black">
                                                  <strong>{index + 1}.</strong> {comment.text}
                                                </Box>
                                              ))}
                                            </Box>
                                          ) : (
                                            <Box textAlign="center" fontSize="sm" fontWeight="bold" color="gray.600">
                                              No comments available
                                            </Box>
                                          )}
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover>



                                  </Box>
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </CardHeader>
                      <Box position="absolute" top={2} left={2}>
                        <Tooltip label="Click to download 100 samples" fontSize="sm" placement="top">
                          <button
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent the card's onClick from triggering
                              handleDownload(bucketName);
                            }}
                          >
                            <MdDownload size="1.5rem" />
                          </button>
                        </Tooltip>
                      </Box>

                    </Card>
                  );
                }
              )}
          </SimpleGrid>
        )
      ) : (
        <Box
          textAlign="center"
          fontSize="lg"
          fontWeight="bold"
          color="gray.500"
          mt={6}
        >
          Enter a Task ID to display clusters
        </Box>
      )}

      {/* ======================== Display ShowBucketColumns Component if Task ID is set ======================== */}

      {showBucketColumns && taskId && selectedColumns && (
        <Box ref={columnCountRef} mt={10}>
          <ShowBucketColumns
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
