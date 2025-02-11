'use client';

import {
    Box,
    Button,
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
import { fetchPaginatedData, getCommentCount } from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';
import NullRecords from './NullRecords';

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

    // Fetch Comment Count
    const { data: commentCount } = useQuery({
        queryKey: ['commentCount', taskId, tableName],
        queryFn: () => getCommentCount(tableName, taskId),
        enabled: !!taskId && !!tableName,
    });

    useEffect(() => {
        if (paginatedData?.total_count !== undefined) {
            setTotalCount(paginatedData.total_count);
        }
    }, [paginatedData]);

    useEffect(() => {
        console.log("Paginated Data:", paginatedData);
        console.log("Comment Count:", commentCount);
    }, [paginatedData, commentCount]);

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


            <div style={{ marginTop: '6rem', padding: '1rem', border: '1px solid #ccc' }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={6}
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
                                <Th>Total Comments</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {!taskId ? (
                                <Tr>
                                    <Td colSpan={5} style={{ fontSize: '2rem', textAlign: 'center', color: 'yellow' }}>
                                        Enter Task Id
                                    </Td>
                                </Tr>
                            ) : isPaginatedDataLoading ? (
                                getSkeleton(rowsPerPage, 5)
                            ) : (
                                paginatedData?.items
                                    ?.filter((item) => selectedColumns.some((col) => col.column_name === item.column_name))
                                    .map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
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
                                            <Td>{commentCount?.[item.column_name] ?? 'NAN'}</Td>
                                        </Tr>
                                    ))
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>

                {taskId && (
                    <Box mt={4} display="flex" justifyContent="center">
                        <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1} mr={2}>
                            Previous
                        </Button>
                        <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>
                            Next
                        </Button>
                    </Box>
                )}
                <Box mt={2} textAlign="center">
                    Page {currentPage} of {totalPages}
                </Box>
            </div>

            {/* NullRecords component (passing all selected columns) */}
            {selectedColumnsForNullRecords && (
                <div ref={nullRecordRef}>
                    <NullRecords
                        taskId={taskId}
                        columnName={selectedColumnsForNullRecords} // Updated prop to accept an array
                        tableName={tableName}
                        onClose={() => setSelectedColumnsForNullRecords(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default ColumnCount;
