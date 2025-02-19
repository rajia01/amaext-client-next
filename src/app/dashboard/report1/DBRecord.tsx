'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Link,
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
  columnName: string[];
  bucketName: string;
}

interface DataItem {
  [key: string]: string | number | null | undefined;
}

const DbRecord: React.FC<DbRecordProps> = ({
  tableName,
  taskId,
  recordId,
  bucketName,
  columnName,
}) => {
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

  return (
    <div
      style={{
        marginTop: '6rem',
        padding: '1rem',
        border: '1px solid #ccc',
      }}
    >
      {/* Breadcrumb Section */}
      <Box
        fontSize="1.4rem"
        border="1px solid gray"
        borderRadius="8px"
        padding="8px 12px"
        color="white"
        mb={12}
        display="inline-block"
        maxWidth="max-content"
      >
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="blue" boxSize={8} />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink fontWeight="bold" color="white">
              {tableName}
            </BreadcrumbLink>
          </BreadcrumbItem>

          {taskId && (
            <BreadcrumbItem>
              <BreadcrumbLink fontWeight="bold" color="white">
                {taskId}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}

          {bucketName && (
            <BreadcrumbItem>
              <BreadcrumbLink fontWeight="bold" color="white">
                {bucketName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}

          {columnName && (
            <BreadcrumbItem>
              <BreadcrumbLink fontWeight="bold" color="white">
                {columnName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}

          {recordId && (
            <BreadcrumbItem>
              <BreadcrumbLink fontWeight="bold" color="white">
                {recordId}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </Box>

      {/* Table Container */}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Column Name</Th>
              <Th>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isDbLoading ? (
              getSkeleton(5, 2) // Show skeleton when loading
            ) : isDbSuccess && data ? (
              Object.entries(data).length > 0 ? (
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
              )
            ) : (
              <Tr>
                <Td colSpan={2}>No data found for ID: {recordId}</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DbRecord;
