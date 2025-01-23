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

interface DbRecordProps {
  recordId: string;
}

interface DataItem {
  [key: string]: any;
}

const DbRecord: React.FC<DbRecordProps> = ({ recordId }) => {
  const {
    data: DbViewList,
    isLoading: isDbLoading,
    isSuccess: isDbSuccess,
  } = useQuery<DataItem>({
    queryKey: ['tableData', recordId],
    queryFn: () => getDataView(recordId),
    refetchOnWindowFocus: false,
  });

  const data = DbViewList?.[0];

  const isValidUrl = (str: string): boolean => {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(str);
  };

  const getSkeleton = (count: number) => (
    <Tr>
      <Td colSpan={2}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} height="53px" mb={2} rounded="md" w="100%" />
        ))}
      </Td>
    </Tr>
  );

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
            <Tbody>{getSkeleton(5)}</Tbody>
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
                      <Td
                        className={`py-3 px-6 text-sm text-gray-700 border-r border-gray-300 ${
                          isInvalidValue ? 'font-bold' : ''
                        }`}
                      >
                        {key}
                      </Td>
                      <Td
                        className="py-3 px-6 text-sm"
                        sx={{
                          color: isInvalidValue ? 'red.500' : 'inherit',
                        }}
                      >
                        {isValidUrl(value) && !value.startsWith('http') ? (
                          <Link
                            as={NextLink}
                            href={value}
                            sx={{
                              textDecoration: 'underline',
                              color: 'blue.500',
                              fontFamily: 'serif',
                              fontWeight: 'normal',
                              _dark: {
                                color: 'orange.800', // Dark mode styling
                              },
                            }}
                          >
                            {value}
                          </Link>
                        ) : isValidUrl(value) ? (
                          <Link variant="brandPrimary" href={value} isExternal>
                            <span
                              style={{
                                textDecoration: 'underline',
                                fontStyle: 'italic',
                              }}
                            >
                              {value}
                            </span>
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
