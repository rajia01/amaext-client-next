'use client';
import {
  Box,
  Flex,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import React, { useState, useRef, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import { GrTooltip } from 'react-icons/gr'; // Fixed GrTooltip import
import { getSkeleton } from 'utils/skeleton';
import { shortenUrl } from 'utils/urlShortner';
import DBRecord from './DBRecord';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface NullRecordsProps {
  taskId: number;
  columnName: string;
  tableName: string;
}

interface Record {
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
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [comment, setComment] = useState<string>(''); // State for comment input
  const dbViewRef = useRef<HTMLDivElement>(null);
  const [rowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch Null Records using TanStack Query and Axios
  const fetchNullRecords = async (columnName: string, page: number) => {
    const response = await axios.get(
      `http://localhost:8000/${tableName}/${taskId}/column/${columnName}`,
      {
        params: { page_no: page, page_per: rowsPerPage },
      },
    );
    console.log('DATATTA: ', response.data);

    return response.data;
  };

  const {
    data: records,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['nullRecords', columnName, currentPage],
    queryFn: () => fetchNullRecords(columnName, currentPage),
  });

  const handleViewDBRecord = (record_id: string) => {
    setSelectedRecordId(record_id);
    setTimeout(() => {
      if (dbViewRef.current) {
        dbViewRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      // Handle the comment submission here
      console.log(`Submitting comment: ${comment}`);
      setComment(''); // Clear comment input
    }
  };

  const totalPages = records ? Math.ceil(records.total_items / rowsPerPage) : 0;
  console.log('total pages: ', totalPages);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (taskId && columnName) {
      // fetchNullRecords(columnName, currentPage);
    }
  }, [currentPage, taskId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}
      >
        <div>
          <div style={{ fontSize: '1.6rem' }}>Column: "{columnName}"</div>
          <div style={{ fontSize: '1.2rem' }}>Task_ID: {taskId}</div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Amazon Seller ID</Th>
                  <Th>Link(sellerid_urlid)</Th>
                  <Th>Created Date</Th>
                  <Th>Modified Date</Th>
                  <Th>Date Difference</Th>
                  <Th>Comment</Th> {/* Added column for comment */}
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
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Type your comment"
                            style={{
                              color: 'white',
                              padding: '0.5rem',
                              marginRight: '0.5rem',
                              width: '60%',
                              backgroundColor: 'transparent',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
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
                            0
                          </span>
                          <Tooltip
                            label={record.comments || 'No comments available'}
                            placement="top"
                          >
                            <button>
                              <GrTooltip
                                style={{
                                  fontSize: '1.8rem',
                                  cursor: 'pointer',
                                  color: '#007bff',
                                }}
                              />
                            </button>
                          </Tooltip>
                          <button
                            onClick={handleCommentSubmit}
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
