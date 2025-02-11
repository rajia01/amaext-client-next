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
import { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { fetchPaginatedData, getCommentCount } from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';
import NullRecords from './NullRecords';

interface PaginatedData {
  total_count: number;
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

  // =================================== TableNames ===================================
  const seller_table = 'ddmapp_amazonsellerdetails_data_1028';
  const product_details = 'ddmapp_amazonproductdetailsnew_data_1028';
  const product_list = 'ddmapp_amazonproductlist_data_1028';

  const tableName: string = seller_table;

  const { data: paginatedData, isLoading: isPaginatedDataLoading } =
    useQuery<PaginatedData>({
      queryKey: ['paginatedData', currentPage, taskId],
      queryFn: () =>
        fetchPaginatedData(tableName, taskId, currentPage, rowsPerPage),
      enabled: !!taskId,
    });

  const { data: commentCount, isLoading: isCommentCountLoading } = useQuery({
    queryKey: ['commentCount'],
    queryFn: () => getCommentCount(tableName, taskId),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (paginatedData?.total_count !== undefined) {
      setTotalCount(paginatedData.total_count);
    }
  }, [paginatedData]);

  const totalPages = paginatedData
    ? Math.ceil(paginatedData.total_items / rowsPerPage)
    : 0;

  // ================================= Handle Button logics =================================

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

  // ======================================== Return body ========================================
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginLeft: '2rem' }}>
          <span style={{ fontSize: '1.8rem', borderBottom: '1px solid white' }}>
            {(() => {
              if (tableName === (seller_table as string)) {
                return 'Amazon Seller Table';
              } else if (tableName === (product_details as string)) {
                return 'Amazon Product Details';
              } else if (tableName === (product_list as string)) {
                return 'Amazon Product List';
              } else {
                return 'Unknown Table';
              }
            })()}
          </span>
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
            <FormLabel
              htmlFor="taskId"
              color={colorMode === 'light' ? 'black' : 'white'}
            >
              Task_ID
            </FormLabel>
            <Input
              id="taskId"
              ref={taskIdInputRef}
              placeholder="Enter Task ID"
              size="lg"
              width="350px"
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

        {/* ================================= Main Table ================================= */}
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
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {item.null_count === 0 ? (
                            <span style={{ color: 'lightgreen' }}>
                              Successful
                            </span>
                          ) : (
                            <FaEye
                              size={24}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleViewClick(item.column_name)}
                            />
                          )}
                        </div>
                      </Td>
                      <Td>
                        {commentCount[item.column_name] !== undefined ||
                          commentCount[item.column_name] !== 0
                          ? commentCount[item.column_name]
                          : 'NAN'}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>

              {paginatedData && (
                <Tfoot>
                  <Tr>
                    <Th>Total: {paginatedData?.total_items}</Th>
                    <Th></Th>
                    <Th>Total: { }</Th>
                    <Th></Th>
                    <Th>Total: { }</Th>
                  </Tr>
                </Tfoot>
              )}
            </Table>
          </TableContainer>
        </div>

        {/* ================================== Pagination ================================== */}
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

        {/* ================================== Null Records Component ================================== */}
        {selectedColumn && (
          <div ref={nullRecordRef}>
            <NullRecords
              taskId={taskId}
              columnName={selectedColumn}
              tableName={tableName}
              onClose={() => setSelectedColumn(null)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
