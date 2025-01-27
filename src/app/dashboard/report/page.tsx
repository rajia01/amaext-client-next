'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorMode,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import NullRecords from './NullRecords';
import { getSkeleton } from 'utils/skeleton';
import { fetchPaginatedData } from 'utils/api/report';

interface PaginatedData {
  items: Array<{
    column_name: string;
    not_null_count: number;
    null_count: number;
  }>;
  total_items: number;
}

const Page: React.FC = () => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [rowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [taskId, setTaskId] = useState<number>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const nullRecordRef = useRef<HTMLDivElement>(null);
  const taskIdInputRef = useRef<HTMLInputElement>(null);
  const { colorMode } = useColorMode();

  // Table names
  const seller_table = 'ddmapp_amazonsellerdetails_data';
  const product_details = 'ddmapp_amazonproductdetailsnew_data_1028';
  const product_list = 'ddmapp_amazonproductlist_data_1028';

  const tableName = seller_table;

  const { data: paginatedData, isLoading: isPaginatedDataLoading } =
    useQuery<PaginatedData>({
      queryKey: ['paginatedData', currentPage, taskId],
      queryFn: () =>
        fetchPaginatedData(tableName, taskId, currentPage, rowsPerPage),
      enabled: !!taskId,
    });

  useEffect(() => {
    if (paginatedData?.total_count !== undefined) {
      setTotalCount(paginatedData.total_count);
    }
  }, [paginatedData]);

  // Fetch Comment Count
  const getCommentCount = async () => {
    const response = await axios.get(
      `http://localhost:8000/${tableName}/${taskId}/total-comments`,
    );

    // Parse the stringified JSON object inside total_comments_by_columns
    const commentCounts = JSON.parse(
      response.data[0].total_comments_by_columns,
    );
    return commentCounts;
  };

  const { data: commentCount, isLoading: isCommentCountLoading } = useQuery({
    queryKey: ['commentCount'],
    queryFn: getCommentCount,
    enabled: !!taskId,
  });

  const totalPages = paginatedData
    ? Math.ceil(paginatedData.total_items / rowsPerPage)
    : 0;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewClick = (columnName: string) => {
    // Scroll to the NullRecords component
    setTimeout(() => {
      if (nullRecordRef.current) {
        nullRecordRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    setSelectedColumn(columnName);
  };

  const handleTaskIdKeyPress = () => {
    const inputValue = taskIdInputRef.current?.value;
    const newTaskId = Number(inputValue);

    if (newTaskId !== taskId) {
      setTaskId(newTaskId);
      // Reset to the first page when taskId changes
      setCurrentPage(1);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginLeft: '2rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{tableName}</span>
        </div>

        <div
          style={{
            display: 'flex',
            marginLeft: '2rem',
            marginTop: '2rem',
            justifyContent: 'flex-start',
            gap: '0.3rem',
          }}
        >
          <FormControl>
            <FormLabel htmlFor="taskId" color={colorMode === 'light' ? 'black' : 'white'}>
              Task_ID
            </FormLabel>
            <Input
              id="taskId"
              // onKeyDown={handleTaskIdKeyPress}
              ref={taskIdInputRef}
              placeholder="Enter Task ID"
              size="lg"
              width="350px"
              // borderColor={{ color: colorMode === 'light' ? 'black' : 'white' }}
              // color={{ color: colorMode === 'light' ? 'black' : 'white' }}
              // _placeholder={{ color: colorMode === 'light' ? 'black' : 'white' }}
              variant="main"
              backgroundColor="transparent"
            />
            <Button
              onClick={handleTaskIdKeyPress}
              size="lg"
              colorScheme="blue"
              width="200px"
              m={2}
            >
              Set Task ID
            </Button>
          </FormControl>
        </div>

        {/* ****************************** Main Table ****************************** */}
        <div style={{ marginTop: '2rem' }}>
          <TableContainer>
            <Table
              fontSize={18}
              variant="simple"
              size="lg"
              sx={{
                borderSpacing: '0rem',
                borderCollapse: 'collapse',
              }}
            >
              <Thead>
                <Tr>
                  <Th>Serial No.</Th>
                  <Th>Column Name</Th>
                  <Th>Null Count</Th>
                  <Th>View Null Records</Th>
                  <Th>Total Comments</Th>
                </Tr>
              </Thead>

              <Tbody>
                {!taskId ? (
                  <Tr>
                    <Td
                      colSpan={5}
                      style={{
                        fontSize: '2rem',
                        textAlign: 'center',
                        color: 'yellow',
                      }}
                    >
                      Enter Task Id
                    </Td>
                  </Tr>
                ) : isPaginatedDataLoading ? (
                  getSkeleton(rowsPerPage, 5)
                ) : (
                  paginatedData?.items?.map((item, index) => (

                    <Tr key={index}>
                      <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                      <Td>{item.column_name}</Td>
                      <Td>
                        <span
                          style={{
                            color: item.null_count > 0 ? 'red' : 'inherit',
                          }}
                        >
                          {item.null_count}
                        </span>{' '}
                        / {totalCount}
                      </Td>
                        <FaEye
                          size={24}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewClick(item.column_name)}
                        />
                        {item.null_count == 0 ? <span style={{ color: 'green.400' }}>Successful</span> : (
                          <FaEye
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleViewClick(item.column_name)}
                          />
                        )}
                      </Td>
                      <Td>
                        {commentCount[item.column_name] !== undefined
                          ? commentCount[item.column_name]
                          : 'NAN'}
                      </Td>
                    </Tr>
                  ))
                )}

              {paginatedData && (
                <Tfoot>
                  <Tr>
                    <Th>Total: {paginatedData?.total_items}</Th>
                    <Th></Th>
                    <Th>Total: {}</Th>
                    <Th></Th>
                    <Th>Total: {}</Th>
                  </Tr>
                </Tfoot>
              )}
            </Table>
          </TableContainer>
        </div>

        {/* ****************************** Pagination ****************************** */}
        {taskId && (
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
        )}

        {/* ****************************** Null Records Component ****************************** */}
        {selectedColumn && (
          <div ref={nullRecordRef}>
            <NullRecords
              taskId={taskId}
              columnName={selectedColumn}
              tableName={tableName}
            />
          </div>
        )}
      </div >
    </>
  );
};

export default Page;
