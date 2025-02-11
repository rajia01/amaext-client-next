'use client';

import {
    Heading,
    Link,
    Skeleton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { getDataView } from 'utils/api/report';
import { getSkeleton } from 'utils/skeleton';

interface DbRecordProps {
    tableName: string;
    taskId: number;
    recordId: string;
}

interface DataItem {
    [key: string]: string | number | null | undefined;
}

const DbRecord: React.FC<DbRecordProps> = ({ tableName, taskId, recordId }) => {
    // console.log('Record ID: ', recordId);

    const {
        data: DbViewList,
        isLoading: isDbLoading,
        isSuccess: isDbSuccess,
    } = useQuery<DataItem>({
        queryKey: ['tableData', recordId],
        queryFn: () => getDataView(tableName, taskId, recordId),
        refetchOnWindowFocus: false,
    });

    const data = DbViewList?.[0];

    const isValidUrl = (str: string): boolean => {
        const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return regex.test(str);
    };

    if (isDbLoading) {
        return (
            <div
                style={{
                    marginTop: '6rem',
                    padding: '1rem',
                    border: '1px solid #ccc',
                }}
            >
                <Heading as="h3" noOfLines={1} textAlign="center">
                    Loading DB Record for ID: {recordId}
                </Heading>
                <TableContainer>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Column Name</Th>
                                <Th>Value</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{getSkeleton(5, 2)}</Tbody>
                    </Table>
                </TableContainer>
            </div>
        );
    }

    if (isDbSuccess && data) {
        return (
            <div
                style={{
                    marginTop: '6rem',
                    padding: '1rem',
                    border: '1px solid #ccc',
                }}
            >
                <Heading as="h3" noOfLines={1} textAlign="center">
                    DB Record for ID: {recordId}
                </Heading>
                <TableContainer>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Column Name</Th>
                                <Th>Value</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {Object.entries(data).length > 0 ? (
                                Object.entries(data).map(([key, value], idx) => {
                                    const isInvalidValue =
                                        value === '' || value === null || value === 'undefined';

                                    return (
                                        <Tr key={idx}>
                                            <Td>{key}</Td>
                                            <Td
                                                style={{
                                                    color: isInvalidValue ? '#FF033E' : 'inherit',
                                                }}
                                            >
                                                {typeof value === 'string' && isValidUrl(value) ? (
                                                    <Link
                                                        as={NextLink}
                                                        href={value}
                                                        sx={{
                                                            textDecoration: 'underline',
                                                            color: 'blue.500',
                                                            fontFamily: 'serif',
                                                            fontWeight: 'normal',
                                                            _dark: {
                                                                color: 'yellow.400',
                                                            },
                                                        }}
                                                        isExternal
                                                    >
                                                        {value}
                                                    </Link>
                                                ) : value ? (
                                                    value
                                                ) : (
                                                    'undefined'
                                                )}
                                            </Td>
                                        </Tr>
                                    );
                                })
                            ) : (
                                <Tr>
                                    <Td colSpan={2}>No data available</Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>
            </div>
        );
    }

    return <div>No data found for ID: {recordId}</div>;
};

export default DbRecord;
