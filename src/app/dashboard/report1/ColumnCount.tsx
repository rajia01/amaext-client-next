'use client';

import {
    Box,
    Button,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
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
import { useEffect, useRef, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { fetchPaginatedData, getCommentCount, getColumnwiseComments } from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';
import NullRecords from './NullRecords';
import { GrTooltip } from 'react-icons/gr';

interface PaginatedData {
    total_count: number;
    items: { column_name: string; not_null_count: number; null_count: number }[];
    total_items: number;
}

interface ColumnCountProps {
    taskId: number;
    tableName: string;
    selectedColumns: { column_name: string; null_count: number }[];
    selectedBucket: string;
}

const ColumnCount: React.FC<ColumnCountProps> = ({ taskId, tableName, selectedColumns, selectedBucket }) => {
    const [selectedColumnsForNullRecords, setSelectedColumnsForNullRecords] = useState<string[] | null>(null);
    const [rowsPerPage] = useState(7);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const nullRecordRef = useRef<HTMLDivElement>(null);
    const { colorMode } = useColorMode();


    // Fetch Paginated Data
    const { data: paginatedData, isLoading: isPaginatedDataLoading } = useQuery<PaginatedData>({
        queryKey: ['paginatedData', currentPage, taskId, tableName, selectedBucket],
        queryFn: () => fetchPaginatedData(tableName, taskId, currentPage, rowsPerPage, selectedBucket),
        enabled: !!taskId && !!tableName && !!selectedBucket,
    });

    // Fetch column-wise comment counts
    const { data: columnCommentCounts } = useQuery({
        queryKey: ['columnCommentCounts', taskId, tableName, selectedBucket],
        queryFn: async () => {
            if (!taskId || !tableName || !selectedBucket) return {};
            const counts: Record<string, number> = {};
            for (const column of selectedColumns) {
                const count = await getCommentCount(tableName, taskId, selectedBucket, column.column_name);
                counts[column.column_name] = count;
            }
            return counts;
        },
        enabled: !!taskId && !!tableName && !!selectedBucket,
    });


    // Fetch column-wise comments
    const { data: columnComments } = useQuery({
        queryKey: ['columnComments', taskId, tableName, selectedBucket],
        queryFn: async () => {
            if (!taskId || !tableName || !selectedBucket) return {};
            const comments: Record<string, any[]> = {};
            for (const column of selectedColumns) {
                const columnData = await getColumnwiseComments(tableName, taskId, selectedBucket, column.column_name);
                comments[column.column_name] = columnData[0]?.comment_column || [];  // 🔹 Corrected data structure access
            }
            return comments;
        },
        enabled: !!taskId && !!tableName && !!selectedBucket,
    });

    useEffect(() => {
        if (paginatedData?.total_count !== undefined) {
            setTotalCount(paginatedData.total_count);
        }
    }, [paginatedData]);

    const totalPages = paginatedData ? Math.ceil(paginatedData.total_items / rowsPerPage) : 0;

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleViewClick = (columnName: string) => {
        setSelectedColumnsForNullRecords([columnName]); // Pass a single column in an array
        scrollToNullRecords();
    };

    const handleViewAllClick = () => {
        const allColumns = selectedColumns.map(col => col.column_name); // Extract all column names
        setSelectedColumnsForNullRecords(allColumns); // Pass all column names as an array
        scrollToNullRecords();
    };


    const scrollToNullRecords = () => {
        setTimeout(() => {
            if (nullRecordRef.current) {
                nullRecordRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>


            <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                    p={4}
                >
                    {/* Breadcrumb Section */}
                    <Box fontSize="1.6rem">
                        {tableName}{' '}
                        <span style={{ color: 'yellow', fontSize: '2rem' }}>/</span>{' '}
                        {taskId}{' '}
                        <span style={{ color: 'yellow', fontSize: '2rem' }}>/</span>{' '}
                        {selectedBucket}
                    </Box>

                    {/* Button to View All Null Records */}
                    <Button colorScheme="blue" onClick={handleViewAllClick}>
                        View All Null Records in Bucket
                    </Button>
                </Box>

                <TableContainer>
                    <Table fontSize={18} variant="simple" size="lg">
                        <Thead>
                            <Tr>
                                <Th>Serial No.</Th>
                                <Th>Column Name</Th>
                                <Th>Null Count</Th>
                                <Th>View Null Records</Th>
                                <Th>Comments</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {selectedColumns.map((item, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td>{item.column_name}</Td>
                                    <Td>
                                        <span style={{ color: item.null_count > 0 ? 'red' : 'inherit' }}>
                                            {item.null_count}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {item.null_count === 0 ? (
                                                <span style={{ color: 'lightgreen' }}>Successful</span>
                                            ) : (
                                                <FaEye size={24} style={{ cursor: 'pointer' }} onClick={() => handleViewClick(item.column_name)} />
                                            )}
                                        </div>
                                    </Td>
                                    <Td textAlign="right">
                                        <Box display="flex" alignItems="center" gap="6px">
                                            <Box px="0.4rem" py="0.1rem" border="1px solid #ccc" borderRadius="4px" fontSize="0.9rem" fontWeight="bold" backgroundColor="gray.100" color="black" minWidth="24px" textAlign="center">
                                                {columnCommentCounts?.[item.column_name] || 0}
                                            </Box>
                                            <Popover trigger="hover" placement="top">
                                                <PopoverTrigger>
                                                    <Box as="button">
                                                        <GrTooltip style={{ fontSize: "1.2rem", cursor: "pointer", color: "#007bff" }} />
                                                    </Box>
                                                </PopoverTrigger>
                                                <PopoverContent bg="gray.100" boxShadow="lg" borderRadius="md" p={3}>
                                                    <PopoverArrow />
                                                    <PopoverBody textAlign='left'>
                                                        {columnComments?.[item.column_name]?.length > 0 ? (
                                                            columnComments[item.column_name].map((comment, i) => (
                                                                <Box key={i} fontSize="sm" color="black">
                                                                    <strong>{i + 1}.</strong> {comment.text}
                                                                </Box>
                                                            ))
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
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>

                {/* {taskId && (
                    <Box mt={4} display="flex" justifyContent="center">
                        <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1} mr={2}>
                            Previous
                        </Button>
                        <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>
                            Next
                        </Button>
                    </Box>
                )} */}
                {/* <Box mt={2} textAlign="center">
                    Page {currentPage} of {totalPages}
                </Box> */}
            </div>

            {/* NullRecords component (passing all selected columns) */}
            {selectedColumnsForNullRecords && (
                <div ref={nullRecordRef}>
                    <NullRecords
                        taskId={taskId}
                        columnName={selectedColumnsForNullRecords} // Updated prop to accept an array
                        tableName={tableName}
                        bucketName={selectedBucket}
                        onClose={() => setSelectedColumnsForNullRecords(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default ColumnCount;
