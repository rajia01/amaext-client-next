'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { fetchBucketComments, fetchBucketData } from 'utils/api/report';
import ShowBucketColumns from './ShowBucketColumns';

import BucketCard from 'components/card/BucketCard';
import InfoCard from 'components/card/InfoCard';
import { LoadingSkeletonGrid } from 'utils/skeleton';
import {
  BackendDataResponse,
  BucketCommentResponse,
  Column,
} from '../../../types/report';

// Table Names
// ========================================================================================================
const testing_table = 'tbl_amazonsellerdetails_ia';
const seller_table = 'amazon_seller_5lakh';
const product_details = 'ddmapp_amazonproductdetailsnew_data_1028';
const product_list = 'ddmapp_amazonproductlist_data_1028';

const tableName: string = seller_table;

// Page Component
// ========================================================================================================
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

  // API Calls
  // ========================================================================================================
  // Fetch bucket data, all the bucket information when taskId is set
  const { data, isLoading, error } = useQuery<BackendDataResponse>({
    queryKey: ['backendData', tableName, taskId, lastFetchTimestamp],
    queryFn: () =>
      fetchBucketData(tableName, taskId) as Promise<BackendDataResponse>,
    enabled: !!tableName && !!taskId, // Fetch only when both are available
  });

  // const bucketCount = data ? Object.keys(data).length : 0;

  // Fetch bucket comments when taskId is set
  const { data: bucketComment } = useQuery<BucketCommentResponse>({
    queryKey: ['bucketComments', tableName, taskId],
    queryFn: () => fetchBucketComments(tableName, taskId),
    enabled: !!tableName && !!taskId, // Fetch only when both are available
    refetchInterval: 1000,
  });

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
      setLastFetchTimestamp(Date.now());
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

  // Button Handles for specific operations
  // ========================================================================================================
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

  const handleTaskIdKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
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

  // Handle delete or remove the bucket from showing in the frontend
  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement>,
    bucketName: string,
  ) => {
    event.stopPropagation();
    setSelectedBucket(bucketName);
    setIsOpen(true);
  };

  const handleConfirmDeletion = () => {
    if (selectedBucket) {
      updateShowFlagAPI(tableName, taskId, selectedBucket, toast);
    }
    setIsOpen(false); // Close the dialog after confirmation
  };

  // All the use effects usages
  // ========================================================================================================
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

  // Page Component Return
  // ========================================================================================================
  return (
    <Box position="relative" p={7} pt={0}>
      {/* Column_Inter_Dependency Info Card */}
      <Box position="absolute" top={0} left={0} right={0} zIndex={10}>
        <InfoCard />
      </Box>

      {/* Table-Name */}
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
              onKeyDown={handleTaskIdKeyDown}
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
          LoadingSkeletonGrid()
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
                      <BucketCard
                        key={bucketName}
                        bucketName={bucketName}
                        data={data}
                        commentCounts={commentCounts}
                        bucketComments={bucketComments}
                        handleCardClick={handleCardClick}
                        handleDownload={handleDownload}
                        handleDelete={handleDelete}
                        handleConfirmDeletion={handleConfirmDeletion}
                        toast={toast}
                        tableName={tableName}
                        taskId={taskId}
                        selectedBucket={selectedBucket}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                      />
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
