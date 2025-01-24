'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import NullRecords from './NullRecords';
import { getSkeleton } from 'utils/skeleton';

interface CommentData {
  column_name: string;
  comment_count: number;
}

interface PaginatedData {
  items: Array<{
    column_name: string;
    not_null_count: number;
    null_count: number;
  }>;
  total_items: number;
}

const Page: React.FC = () => {
  const router = useRouter();
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [tableLoading, setTableLoading] = useState(true);
  const [rowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [taskId, setTaskId] = useState<number>();
  const [totalCount, setTotalCount] = useState<number>(0);

  const nullRecordRef = useRef<HTMLDivElement>(null);

  const seller_table = 'ddmapp_amazonsellerdetails_data';
  const product_details = 'ddmapp_amazonproductdetailsnew_data_1028';
  const product_list = 'ddmapp_amazonproductlist_data_1028';

  // Fetch Paginated Data using TanStack Query and Axios
  const fetchPaginatedData = async (page: number) => {
    const response = await axios.get(
      `http://localhost:8000/${product_list}/task_id/${taskId}`,
      {
        params: { page_no: page, page_per: rowsPerPage },
      },
    );
    console.log('Data: ', response.data);

    setTotalCount(response.data.total_count);

    return response.data;
  };

  const { data: paginatedData, isLoading: isPaginatedDataLoading } =
    useQuery<PaginatedData>({
      queryKey: ['paginatedData', currentPage],
      queryFn: () => fetchPaginatedData(currentPage),
      enabled: !!taskId,
    });

  // console.log('Paginated Data:   ', paginatedData);

  // Fetch Comment Count
  const getCommentCount = async () => {
    const response = await axios.get(
      `http://localhost:8000/${product_list}/${taskId}/total-comments`,
    );

    // Parse the stringified JSON object inside total_comments_by_columns
    const commentCounts = JSON.parse(
      response.data[0].total_comments_by_columns,
    );

    // console.log('ResponseData: ', response.data);
    // console.log('Comment Counts: ', commentCounts);
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

  useEffect(() => {
    if (taskId) {
      fetchPaginatedData(currentPage);
      // getCommentCount();
    }
  }, [currentPage, taskId]);

  const handleViewClick = (columnName: string) => {
    // Scroll to the NullRecords component
    setTimeout(() => {
      if (nullRecordRef.current) {
        nullRecordRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
    setSelectedColumn(columnName);
  };

  const handleTaskIdKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const inputValue = (e.target as HTMLInputElement).value;
      setTaskId(Number(inputValue));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginLeft: '2rem', marginTop: '2rem' }}>
          <FormControl>
            <FormLabel htmlFor="taskId" color="white">
              Task_ID
            </FormLabel>
            <Input
              id="taskId"
              onKeyDown={handleTaskIdKeyPress}
              placeholder="Enter Task ID and press Enter"
              size="lg"
              width="300px"
              borderColor="white"
              color="white"
              _placeholder={{ color: 'white' }}
              backgroundColor="transparent"
            />
            ;
          </FormControl>
        </div>

        {/* Table */}
        <div style={{ marginTop: '2rem' }}>
          <TableContainer>
            <Table variant="simple" size="lg">
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
                {isPaginatedDataLoading
                  ? getSkeleton(rowsPerPage, 5)
                  : paginatedData?.items?.map((item, index) => (
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
                          <FaEye
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleViewClick(item.column_name)}
                          />
                        </Td>
                        <Td>
                          {commentCount[item.column_name] !== undefined
                            ? commentCount[item.column_name]
                            : 'NAN'}
                        </Td>
                      </Tr>
                    ))}
              </Tbody>

              <Tfoot>
                <Tr>
                  <Th>Total: {paginatedData?.total_items}</Th>
                  <Th></Th>
                  <Th>Total: {}</Th>
                  <Th></Th>
                  <Th>Total: {}</Th>
                </Tr>
              </Tfoot>
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

        {/* Null Records Component */}
        {selectedColumn && (
          <div ref={nullRecordRef}>
            <NullRecords
              taskId={taskId}
              columnName={selectedColumn}
              tableName={product_list}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
