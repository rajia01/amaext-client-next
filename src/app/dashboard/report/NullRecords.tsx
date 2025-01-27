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
  PopoverContent,
  Popover,
  PopoverBody,
  PopoverArrow,
  PopoverTrigger,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { GrTooltip } from 'react-icons/gr';
import {
  fetchNullRecords,
  getColumnwiseComments,
  postComment,
} from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';
import DBRecord from './DBRecord';

interface NullRecordsProps {
  taskId: number;
  columnName: string;
  tableName: string;
  onClose: () => void;
}

interface Record {
  id: any;
  ddmapp_amazonsellerdetails_data_1028_id: string;
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
  onClose,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [comment, setComment] = useState<{ [id: number]: string }>({});
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
      fetchNullRecords(columnName, currentPage, tableName, taskId, rowsPerPage),
  });

  // **************************************************************************************

  const handleCommentSubmit = (srId: number, comment: string) => {
    if (comment.trim()) {
      console.log(`Submitting comment for record ${srId}: ${comment}`);

      postComment(tableName, taskId, columnName, srId, comment);

      setComment((prevComments) => ({
        ...prevComments,
        [srId]: '',
      }));
    }
  };

  // **************************************************************************************
  const handleViewDBRecord = (record_id: string) => {
    setSelectedRecordId(record_id);
    setTimeout(() => {
      if (dbViewRef.current) {
        dbViewRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const totalPages = records ? Math.ceil(records.total_items / rowsPerPage) : 0;
  console.log('total pages: ', totalPages);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fetch all comments for the null records
  const { data: allComments } = useQuery({
    queryKey: ['comments', tableName, taskId, columnName],
    queryFn: () => getColumnwiseComments(tableName, taskId, columnName),
  });

  console.log('Comments: ', allComments);

  useEffect(() => {
    if (taskId && columnName) {
    }
  }, [currentPage, taskId]);

  const handleCommentChange = (id: number, comment: string) => {
    setComment(() => ({
      [id]: comment,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* <Box> */}
      {/* <Button onClick={onClose} colorScheme="red" size="sm" mb={4}> */}
      {/* Close */}
      {/* </Button> */}
      {/* Add your existing NullRecords content here */}

      {/* </Box> */}

      <div
        style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}
      >
        <div>
          <div style={{ fontSize: '1.6rem' }}>
            {tableName}{' '}
            <span style={{ color: 'yellow', fontSize: '2rem' }}>/</span>{' '}
            {taskId}{' '}
            <span style={{ color: 'yellow', fontSize: '2rem' }}>/</span>{' '}
            {columnName}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Amazon Seller ID</Th>
                  <Th>Link</Th>
                  <Th>Created Date</Th>
                  <Th>Modified Date</Th>
                  <Th>Date Difference</Th>
                  <Th>Comment</Th>
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
                        <Flex align="center" justify="space-between">
                          <Link
                            href={record.link}
                            color="blue.500"
                            _hover={{ color: 'blue.700' }}
                            isExternal
                            _visited={{ color: 'purple.500' }}
                          >
                            LINK
                          </Link>
                          <Box>
                            <FaEye
                              onClick={() => handleViewDBRecord(record.id)}
                              style={{
                                cursor: 'pointer',
                                verticalAlign: 'middle',
                                fontSize: '1.2rem',
                              }}
                            />
                          </Box>
                        </Flex>
                      </Td>
                      <Td>{record.created_date}</Td>
                      <Td>{record.modified_date}</Td>
                      <Td>{record.date_diff}</Td>
                      <Td>
                        <Flex
                          align="center"
                          justify="space-between"
                          width="100%"
                          gap="8"
                        >
                          <input
                            type="text"
                            value={comment[record.id] || ''}
                            onChange={(e) =>
                              handleCommentChange(record.id, e.target.value)
                            }
                            placeholder="Type your comment"
                            style={{
                              color: colorMode === 'light' ? 'black' : 'white',
                              padding: '0.5rem',
                              marginRight: '0.5rem',
                              width: '60%',
                              backgroundColor: 'transparent',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                            className={
                              colorMode === 'light'
                                ? 'light-placeholder'
                                : 'dark-placeholder'
                            }
                          />

                          {/* Comment count */}
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.5rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          >
                            {allComments?.filter(
                              (eachComment: any) =>
                                eachComment.id === record.id,
                            ).length || 0}
                          </span>
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
                                    allComments?.filter(
                                      (eachComment: any) =>
                                        eachComment.id === record.id,
                                    ).length > 0
                                      ? allComments
                                          .filter(
                                            (eachComment: any) =>
                                              eachComment.id === record.id,
                                          )
                                          .map(
                                            (eachComment: any, index: number) =>
                                              `${index + 1}. ${
                                                eachComment.comment
                                              }`,
                                          )
                                          .join('<br />')
                                      : 'No comments available',
                                }}
                              />
                            </PopoverContent>
                          </Popover>

                          <button
                            onClick={() =>
                              handleCommentSubmit(record.id, comment[record.id])
                            }
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50px',
                            }}
                          >
                            Submit
                          </button>
                        </Flex>
                      </Td>
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
        <div style={{ marginBottom: '4rem' }}>
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
      </div>

      <div>
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
    </div>
  );
};

export default NullRecords;
