'use client';

import {
  Box,
  Button,
  Flex,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  useColorMode,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { addComment, fetchNullRecords } from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';
import DBRecord from './DBRecord';
import { ChevronRightIcon } from '@chakra-ui/icons';

interface NullRecordsProps {
  taskId: number;
  columnName: string[];
  tableName: string;
  bucketName: string;
  onClose: () => void;
}

interface Record {
  id: any;
  link: string;
  created_date: string;
  modified_date: string;
  Date_Diff: string;
  comments: string;
}

const NullRecords: React.FC<NullRecordsProps> = ({
  taskId,
  columnName,
  tableName,
  bucketName,
  onClose,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [storedTotalPages, setStoredTotalPages] = useState(0);
  const dbViewRef = useRef<HTMLDivElement>(null);
  const [rowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { colorMode } = useColorMode();
  const [toastShown, setToastShown] = useState(false); // Prevent repeated toasts
  const toast = useToast();
  const maxLength = 150;

  const {
    data: records,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['nullRecords', columnName, currentPage],
    queryFn: () =>
      fetchNullRecords(tableName, taskId, columnName, currentPage, rowsPerPage),
  });

  // **************************************************************************************

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      console.log(`Submitting comment: ${comment}`);

      // Check if it's a single column or a bucket-wide comment
      const isSingleColumn = columnName.length === 1;

      // Call API with appropriate parameters
      addComment(
        tableName,
        taskId,
        bucketName,
        comment,
        isSingleColumn ? columnName[0] : undefined,
      );

      // Show success toast after submission
      toast({
        title: 'Comment Submitted!',
        description: 'Your comment has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Clear input after submission
      setComment('');
    } else {
      // Show error toast if comment is empty
      toast({
        title: 'Empty Comment',
        description: 'Please enter a comment before submitting.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // **************************************************************************************
  const handleViewDBRecord = (record_id: string) => {
    setSelectedRecordId(record_id);
    setTimeout(() => {
      dbViewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const totalPages = records ? Math.ceil(records.total_items / rowsPerPage) : 0;

  useEffect(() => {
    if (records?.total_items) {
      const newTotalPages = Math.ceil(records.total_items / rowsPerPage);
      if (newTotalPages > 0) {
        setStoredTotalPages(newTotalPages);
      }
    }
  }, [records, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= storedTotalPages) {
      setCurrentPage(page);
    }
  };

  // useEffect(() => { }, [currentPage, taskId]);

  const getCommentPlaceholder = () => {
    return columnName.length === 1
      ? `Enter the comment for ${columnName[0]}`
      : `Enter the comment for ${bucketName}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue.length >= maxLength) {
      if (!toastShown) {
        toast({
          title: 'Character limit reached!',
          description: `You can only enter up to ${maxLength} characters.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        setToastShown(true); // Prevent multiple toasts on each keystroke
      }
    } else {
      setToastShown(false); // Reset when the user deletes characters
    }

    setComment(inputValue.slice(0, maxLength)); // Ensures max length is respected
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '1rem',
          border: '1px solid #ccc',
          marginTop: '6rem',
        }}
      >
        <div>
          {/* Breadcrumb Section */}
          <Box
            fontSize="1.4rem"
            border="1px solid gray"
            borderRadius="8px"
            padding="8px 12px"
            color="white"
            mb={12}
            display="inline-block"
            maxWidth="max-content"
          >
            <Breadcrumb
              spacing="8px"
              separator={<ChevronRightIcon color="blue" boxSize={8} />}
            >
              <BreadcrumbItem>
                <BreadcrumbLink fontWeight="bold" color="white">
                  {tableName}
                </BreadcrumbLink>
              </BreadcrumbItem>

              {taskId && (
                <BreadcrumbItem>
                  <BreadcrumbLink fontWeight="bold" color="white">
                    {taskId}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}

              {bucketName && (
                <BreadcrumbItem>
                  <BreadcrumbLink fontWeight="bold" color="white">
                    {bucketName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}

              {columnName && (
                <BreadcrumbItem>
                  <BreadcrumbLink fontWeight="bold" color="white">
                    {columnName.join(', ')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
            </Breadcrumb>
          </Box>

          <div>
            <Flex align="center" gap={4} my={4} width="100%">
              <input
                type="text"
                value={comment}
                onChange={handleChange}
                placeholder={getCommentPlaceholder()}
                maxLength={maxLength}
                style={{
                  color: colorMode === 'light' ? 'black' : 'white',
                  padding: '0.75rem',
                  flex: 1, // Takes up most of the space
                  backgroundColor: 'transparent',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
                className={
                  colorMode === 'light'
                    ? 'light-placeholder'
                    : 'dark-placeholder'
                }
              />
              <Button
                onClick={handleCommentSubmit}
                size="md"
                colorScheme="blue"
              >
                Submit
              </Button>
            </Flex>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID (Primary Key)</Th>
                  <Th>Link</Th>
                  <Th>Actions</Th> {/* Actions column right after Link */}
                  <Th>Created Date</Th>
                  <Th>Modified Date</Th>
                  <Th>Date Difference</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  getSkeleton(7, 6)
                ) : isError ? (
                  <Tr>
                    <Td colSpan={6}>
                      Error:{' '}
                      {error instanceof Error ? error.message : 'Unknown error'}
                    </Td>
                  </Tr>
                ) : records?.items?.length > 0 ? (
                  records.items.map((record: Record, index: number) => (
                    <Tr key={index}>
                      <Td>{record.id}</Td>
                      <Td>
                        <Link
                          href={record.link}
                          color="blue.500"
                          _hover={{ color: 'blue.700' }}
                          isExternal
                          _visited={{ color: 'purple.500' }}
                        >
                          LINK
                        </Link>
                      </Td>
                      <Td>
                        {' '}
                        {/* Actions Column immediately after Link */}
                        <Box textAlign="center">
                          <FaEye
                            onClick={() => handleViewDBRecord(record.id)}
                            style={{
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                            }}
                          />
                        </Box>
                      </Td>
                      <Td>{record.created_date}</Td>
                      <Td>{record.modified_date}</Td>
                      <Td>{record.Date_Diff}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6}>No records found</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </div>

        {/* Pagination */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            onClick={() => handlePageChange(1)}
            isDisabled={currentPage === 1}
            mr={2}
          >
            First Page
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            mr={2}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === storedTotalPages}
            mr={2}
          >
            Next
          </Button>
          <Button
            onClick={() => handlePageChange(storedTotalPages)}
            isDisabled={currentPage === storedTotalPages}
          >
            Last Page
          </Button>
        </Box>
        <Box mt={2} textAlign="center">
          Page {currentPage} of {storedTotalPages}
        </Box>
      </div>

      {selectedRecordId && (
        <div ref={dbViewRef}>
          <DBRecord
            tableName={tableName}
            taskId={taskId}
            recordId={selectedRecordId}
            columnName={columnName}
            bucketName={bucketName}
          />
        </div>
      )}
    </div>
  );
};

export default NullRecords;
