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
  useColorMode,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { addComment, fetchNullRecords } from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';
import DBRecord from './DBRecord';

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
  date_diff: string;
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
  const dbViewRef = useRef<HTMLDivElement>(null);
  const [rowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { colorMode } = useColorMode();

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

      // Clear input after submission
      setComment('');
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

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {}, [currentPage, taskId]);

  const getCommentPlaceholder = () => {
    return columnName.length === 1
      ? `Enter the comment for ${columnName[0]}`
      : `Enter the comment for ${bucketName}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '1rem',
          border: '1px solid #ccc',
          marginTop: '3rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.6rem' }}>
            {tableName}{' '}
            <span style={{ color: 'blue', fontSize: '1.8rem' }}>/</span>{' '}
            {taskId}{' '}
            <span style={{ color: 'blue', fontSize: '1.8rem' }}>/</span>{' '}
            {bucketName}{' '}
            <span style={{ color: 'blue', fontSize: '1.8rem' }}>/</span>{' '}
            {columnName.join(', ')}
          </div>

          <div>
            <Flex align="center" gap={4} my={4} width="100%">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={getCommentPlaceholder()}
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

              <button
                onClick={handleCommentSubmit}
                style={{
                  fontSize: '0.9rem',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Submit
              </button>
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
                  getSkeleton(5, 6)
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
                      <Td>{record.date_diff}</Td>
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
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            mr={2}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Box>
        <Box mt={2} textAlign="center">
          Page {currentPage} of {totalPages}
        </Box>
      </div>

      {selectedRecordId && (
        <div ref={dbViewRef}>
          <DBRecord
            tableName={tableName}
            taskId={taskId}
            recordId={selectedRecordId}
          />
        </div>
      )}
    </div>
  );
};

export default NullRecords;
