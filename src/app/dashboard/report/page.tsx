'use client';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  Toast,
  Tooltip,
  Tr,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { GrTooltip } from 'react-icons/gr';
import { MdDelete, MdDownload } from 'react-icons/md';
import { fetchBucketComments, fetchBucketData } from 'utils/api/report';
import ShowBucketColumns from './ShowBucketColumns';

import {
  BackendDataResponse,
  BucketCommentResponse,
  Column,
} from '../../../types/report';

// ============================== Table Names ==============================
// tbl_amazonsellerdetails_ia
const seller_table = 'kevin_testing';
const product_details = 'ddmapp_amazonproductdetailsnew_data_1028';
const product_list = 'ddmapp_amazonproductlist_data_1028';

const tableName: string = 'amazon_seller_5lakh';

// ============================ Table Component ============================
function showTable(
  columns: { column_name: string; null_count: number }[],
  Pivot_Columns: string[],
) {
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
          {columns?.map((column, index) => (
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
                  <Tooltip
                    label="This column is inversely related to others"
                    aria-label="Pivot column tooltip"
                    placement="top"
                    hasArrow
                  >
                    <Box as="span" cursor="pointer">
                      {column.column_name}
                    </Box>
                  </Tooltip>
                ) : (
                  column.column_name
                )}
              </Td>
              <Td textAlign="right">
                {column.null_count ? `${column.null_count}` : 'No null'}{' '}
                {/* Fixed template literal */}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
// ====================================== Add the Info Card Component  ======================================
const Column_Inter_DependencyInfoCard: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Card
      position="absolute"
      top="20%"
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
        Column Inter-Dependency Values
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
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(null);
  const [showBucketColumns, setShowBucketColumns] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<
    { column_name: string; null_count: number }[] | null
  >(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [placement, setPlacement] = useState<'right-start' | 'left-start'>(
    'right-start',
  );
  const taskIdInputRef = useRef<HTMLInputElement>(null);
  const columnCountRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast(); // ✅ Ensure toast is initialized properly
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    if (popoverRef.current) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // If popover is overflowing on the right, move it to the left
      if (popoverRect.right > viewportWidth) {
        setPlacement('left-start');
      } else {
        setPlacement('right-start');
      }
    }
  }, []);

  // Fetch bucket data when taskId is set
  const { data, isLoading, error } = useQuery<BackendDataResponse>({
    queryKey: ['backendData', tableName, taskId, lastFetchTimestamp],
    queryFn: () =>
      fetchBucketData(tableName, taskId) as Promise<BackendDataResponse>,
    enabled: !!tableName && !!taskId, // Fetch only when both are available
  });

  // Fetch bucket comments when taskId is set
  const { data: bucketComment } = useQuery<BucketCommentResponse>({
    queryKey: ['bucketComments', tableName, taskId],
    queryFn: () => fetchBucketComments(tableName, taskId),
    enabled: !!tableName && !!taskId, // Fetch only when both are available
    refetchInterval: 1000,
  });

  const handleTaskIdKeyPress = () => {
    const inputValue = taskIdInputRef.current?.value;
    const newTaskId = Number(inputValue);
    if (!inputValue || isNaN(newTaskId)) {
      toast({
        title: 'Task ID Required',
        description: 'Please enter a valid Task ID before proceeding.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setTaskId(newTaskId);
    setShowBucketColumns(false);
    setLastFetchTimestamp(Date.now());

    toast({
      title: 'Task ID Set',
      description: `Task ID ${newTaskId} has been successfully set.`,
      status: 'success',
      duration: 1000,
      isClosable: true,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const inputValue = taskIdInputRef.current?.value;
      const newTaskId = Number(inputValue);
      if (!inputValue || isNaN(newTaskId)) {
        toast({
          title: 'Task ID Required',
          description: 'Please enter a valid Task ID before proceeding.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTaskId(newTaskId);
      setShowBucketColumns(false);
      setLastFetchTimestamp(Date.now());

      toast({
        title: 'Task ID Set',
        description: `Task ID ${newTaskId} has been successfully set.`,
        status: 'success',
        duration: 1000,
        isClosable: true,
      });
    }
  };

  // update show_flag api call
  const updateShowFlagAPI = async (
    tableName: string,
    taskId: number,
    bucketName: string,
    toast: any,
  ) => {
    try {
      const queryParams = new URLSearchParams({
        bucket_name: bucketName,
      }).toString();

      const response = await fetch(
        `http://localhost:8000/${tableName}/${taskId}/update-show-flag/?${queryParams}`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Error updating show flag');
      }

      const data = await response.json();

      // Show success toast
      toast({
        title: `Flag set to false for ${bucketName}`,
        description: 'The show flag has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return data;
    } catch (error) {
      console.error('Error:', error);

      // Show error toast if request fails
      toast({
        title: 'Update Failed',
        description: 'Could not update show flag. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update the `handleCardClick` method to pass the Pivot_Columns
  const handleCardClick = (
    bucketName: string,
    columns: { column_name: string; null_count: number }[],
    Pivot_Columns: string[], // Make sure pivot columns are passed
  ) => {
    setSelectedColumns(columns);
    setSelectedBucket(bucketName);
    setShowBucketColumns(true);
    setTimeout(() => {
      columnCountRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Card
        key={index}
        w="370px"
        h="auto"
        p={4}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Skeleton height="40px" mb={4} />
        <SkeletonText mt="4" noOfLines={4} spacing="4" />
      </Card>
    ));
  };

  const handleDownload = async (
    tableName: string,
    taskId: number,
    bucket: string,
    columns: Column[],
    toast: ReturnType<typeof useToast>,
  ): Promise<void> => {
    try {
      // Ensure selectedColumns is properly initialized
      if (!columns || !Array.isArray(columns)) {
        throw new Error('selectedColumns is null or not an array');
      }

      // Extract only column names from selectedColumns
      const queryParams = columns
        .map(
          (col: { column_name: string }) =>
            `columns=${encodeURIComponent(col.column_name)}`,
        )
        .join('&');

      const apiUrl = `http://localhost:8000/${tableName}/task_id/${taskId}/download-sample/${bucket}/?${queryParams}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Convert response to a Blob and initiate file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `sample_data_${tableName}_${taskId}_${bucket}.csv`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Successful',
        description: `The sample file for ${bucket} has been downloaded.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading file:', error);

      toast({
        title: 'Download Failed',
        description: 'Could not download the file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error Fetching Data',
        description:
          'There was a problem retrieving the data. Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  return (
    <Box position="relative" p={7} pt={0}>
      {/* Column_Inter_Dependency Info Card */}
      <Box position="absolute" top={0} left={0} right={0} zIndex={10}>
        <Column_Inter_DependencyInfoCard />
      </Box>

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
                return tableName;
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
              onKeyDown={handleKeyDown}
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
            display="flex"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            fontSize={['xl', '2xl', '3xl']}
            fontWeight="bold"
            color="red.500"
            height={['10vh', '30vh', '50vh']}
            // border={'1px solid white'}
          >
            Error fetching data
          </Box>
        ) : (
          <Box width="100%" height="100%" overflowX="hidden" overflowY="hidden">
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing={6}
              minChildWidth="370px"
              justifyContent="center"
              alignItems="stretch"
              display="grid"
              mt="20px"
              gridTemplateColumns="repeat(auto-fit, minmax(370px, 1fr))"
              marginX="20px"
            >
              {data &&
                Object.entries(data).map(
                  ([
                    bucketName,
                    {
                      columns,
                      Column_Inter_Dependency,
                      Common_Null_Count,
                      Uncommon_Null_Count,
                      Show_Flag,
                    },
                  ]) => {
                    if (Show_Flag != true) return null;
                    // Extract comment counts and bucket comments
                    const commentCounts = bucketComment
                      ? Object.fromEntries(
                          Object.entries(bucketComment).map(
                            ([name, bucketData]) => [
                              name,
                              bucketData.bucket_comment_count || 0,
                            ],
                          ),
                        )
                      : {};

                    const bucketComments = bucketComment
                      ? Object.fromEntries(
                          Object.entries(bucketComment).map(
                            ([name, bucketData]) => [
                              name,
                              bucketData.bucket_comments || [],
                            ],
                          ),
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
                        bg={colorMode === 'light' ? 'white' : 'gray.800'}
                        transition="transform 0.3s ease, box-shadow 0.3s ease"
                        _hover={{
                          boxShadow: '0px 0px 15px rgba(0, 120, 255, 0.4)',
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          handleCardClick(
                            bucketName,
                            data[bucketName]?.columns || [],
                            data[bucketName]?.Pivot_Columns || [],
                          )
                        } // Pass Pivot_Columns here
                      >
                        <CardHeader pb={3} textAlign="center">
                          <Heading
                            size="md"
                            color="blue.600"
                            display="inline-flex"
                            alignItems="center"
                          >
                            {bucketName}
                            {Column_Inter_Dependency === 'Full' && (
                              <FaCheckCircle
                                color="#90EE90"
                                style={{ marginLeft: '5px' }}
                              />
                            )}
                          </Heading>

                          <Box
                            position="absolute"
                            top={2}
                            right={2}
                            fontSize="lg"
                            cursor="pointer"
                          >
                            <Popover placement={placement} trigger="click">
                              <PopoverTrigger>
                                <Box
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {' '}
                                  {/* Prevents card click */}
                                  <FaInfoCircle />
                                </Box>
                              </PopoverTrigger>
                              <PopoverContent
                                ref={popoverRef}
                                maxH="300px"
                                overflowY="auto" // Enables vertical scrolling
                                overflowX="hidden" // Disables horizontal scrolling
                                boxShadow="lg"
                                borderRadius="md"
                                p={3}
                                onClick={(
                                  event: React.MouseEvent<HTMLButtonElement>,
                                ) => event.stopPropagation()} // Prevents card click event
                                width="fit-content" // Ensures it only takes necessary width
                                minW="200px" // Prevents it from shrinking too much
                              >
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody whiteSpace="nowrap">
                                  {showTable(
                                    columns,
                                    data[bucketName]?.Pivot_Columns || [],
                                  )}{' '}
                                  {/* Pass Pivot_Columns here */}
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                          </Box>

                          <TableContainer mt={3}>
                            <Table variant="simple" size="sm">
                              <Tbody>
                                <Tr>
                                  <Td fontWeight="bold">
                                    Column Inter-Dependency
                                  </Td>
                                  <Td textAlign="right">
                                    {
                                      typeof Column_Inter_Dependency ===
                                      'string'
                                        ? // Check if the string can be parsed as a number
                                          !isNaN(
                                            parseFloat(Column_Inter_Dependency),
                                          )
                                          ? // If it's a number (as string), truncate to two decimals
                                            parseFloat(Column_Inter_Dependency)
                                              .toString()
                                              .slice(
                                                0,
                                                Column_Inter_Dependency.indexOf(
                                                  '.',
                                                ) + 3,
                                              ) + '%' // Truncate after two decimal places
                                          : // If it's not a number, display it as is (e.g., "Full", "Empty")
                                            Column_Inter_Dependency
                                        : // For numbers, truncate to two decimal places
                                          parseFloat(
                                            Column_Inter_Dependency.toString(),
                                          )
                                            .toString()
                                            .slice(
                                              0,
                                              Column_Inter_Dependency.toString().indexOf(
                                                '.',
                                              ) + 3,
                                            ) + '%' // Truncate to two decimal places
                                    }
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Columns</Td>
                                  <Td textAlign="right">{columns.length}</Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Common Null Count</Td>
                                  <Td textAlign="right">
                                    {Common_Null_Count ?? 'N/A'}
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Uncommon Null Count</Td>
                                  <Td textAlign="right">
                                    {Uncommon_Null_Count >= 0
                                      ? Uncommon_Null_Count
                                      : ' '}
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td fontWeight="bold">Comments</Td>
                                  <Td textAlign="right">
                                    <Box
                                      display="flex"
                                      gap="10px"
                                      justifyContent="end"
                                    >
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
                                            onClick={(
                                              event: React.MouseEvent<HTMLButtonElement>,
                                            ) => event.stopPropagation()} // Prevents card click
                                          >
                                            <GrTooltip
                                              style={{
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                color: '#007bff',
                                              }}
                                            />
                                          </Box>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          onClick={(
                                            event: React.MouseEvent<HTMLButtonElement>,
                                          ) => event.stopPropagation()}
                                          bg="gray.100"
                                          boxShadow="lg"
                                          borderRadius="md"
                                          p={3}
                                          maxH="280px" // Set max height for the popover
                                          overflowY="auto" // Enable vertical scrolling
                                          maxWidth="1000px" // Set a max width to prevent excessive stretching
                                          minW="200px" // Prevent the popover from becoming too narrow
                                        >
                                          <PopoverCloseButton color="black" />
                                          <PopoverBody textAlign="left">
                                            {bucketComments?.[bucketName]
                                              ?.length > 0 ? (
                                              <Box
                                                display="flex"
                                                flexDirection="column"
                                                gap={2}
                                              >
                                                {bucketComments[bucketName]
                                                  .filter(
                                                    (comment) =>
                                                      comment && comment.text,
                                                  ) // Ensure comment is not null/undefined
                                                  .map((comment, index) => (
                                                    <Box key={index}>
                                                      <Box
                                                        fontSize="sm"
                                                        color="black"
                                                        maxWidth="100%" // Ensure it respects the parent width
                                                        whiteSpace="normal" // Allow wrapping
                                                        wordBreak="break-word" // Break long words
                                                      >
                                                        <strong>
                                                          {index + 1}.
                                                        </strong>{' '}
                                                        {comment?.text ||
                                                          'No text available'}
                                                      </Box>
                                                      <Box
                                                        fontSize="xs"
                                                        color="gray.600"
                                                      >
                                                        {comment?.['time-stamp']
                                                          ? new Date(
                                                              comment[
                                                                'time-stamp'
                                                              ],
                                                            ).toLocaleString()
                                                          : 'No timestamp'}
                                                      </Box>
                                                    </Box>
                                                  ))}
                                              </Box>
                                            ) : (
                                              <Box
                                                textAlign="center"
                                                fontSize="sm"
                                                fontWeight="bold"
                                                color="gray.600"
                                              >
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
                          <Tooltip
                            label="Click to download 100 samples"
                            fontSize="sm"
                            placement="top"
                          >
                            {/* Only render the button if Common_Null_Count is greater than 0 */}
                            {Common_Null_Count > 0 && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation(); // Prevent the card's onClick from triggering

                                  // Handle download if Common_Null_Count > 0
                                  handleDownload(
                                    tableName,
                                    taskId,
                                    bucketName,
                                    columns,
                                    toast,
                                  );
                                }}
                              >
                                <MdDownload size="1.5rem" />
                              </button>
                            )}
                          </Tooltip>
                        </Box>
                        <Box bottom={2} right={2} alignSelf={'end'}>
                          <Tooltip
                            label="Remove this cluster"
                            fontSize="sm"
                            placement="top"
                          >
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedBucket(bucketName);
                                setIsOpen(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <MdDelete size="1.5rem" />
                            </button>
                          </Tooltip>
                        </Box>
                        <AlertDialog
                          isOpen={isOpen}
                          leastDestructiveRef={cancelRef}
                          onClose={() => setIsOpen(false)}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                              Confirm Deletion
                            </AlertDialogHeader>

                            <AlertDialogBody>
                              Are you sure you want to delete the cluster `
                              {selectedBucket}` ? Once deleted, it cannot be
                              restored.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                              <Button
                                ref={cancelRef}
                                onClick={() => setIsOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                colorScheme="red"
                                onClick={() => {
                                  if (selectedBucket) {
                                    updateShowFlagAPI(
                                      tableName,
                                      taskId,
                                      selectedBucket,
                                      toast,
                                    );
                                  }
                                  setIsOpen(false); // Close the dialog after confirmation
                                }}
                                ml={3}
                              >
                                Confirm
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Card>
                    );
                  },
                )}
            </SimpleGrid>
          </Box>
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
        <Box ref={columnCountRef} mt={16}>
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
