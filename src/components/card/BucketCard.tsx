import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Box,
  Button,
  Card,
  CardHeader,
  Heading,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tooltip,
  Tr,
  useColorMode,
} from '@chakra-ui/react';
import BucketColumns from 'components/tables/BucketColumns';
import { useRef, useState } from 'react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { GrTooltip } from 'react-icons/gr';
import { MdDelete, MdDownload } from 'react-icons/md';

interface Column {
  type: string;
  null_count: number;
  column_name: string;
  not_null_count: number;
}

interface BucketData {
  columns: Column[];
  Show_Flag: boolean;
  Pivot_Columns: string[];
  Common_Null_Count: number;
  Uncommon_Null_Count: number;
  Column_Inter_Dependency: any;
}

interface Comment {
  text: string;
  'time-stamp'?: string;
}

interface BucketCardProps {
  bucketName: string;
  data: Record<string, BucketData>;
  handleCardClick: (
    bucketName: string,
    columns: Column[],
    pivotColumns: string[],
    columnInterDependency: string,
  ) => void;
  commentCounts: Record<string, number>;
  bucketComments: Record<string, Comment[]>;
  handleDownload: (
    tableName: string,
    taskId: number,
    bucketName: string,
    columns: Column[],
    toast: any,
  ) => void;
  handleDelete: (
    event: React.MouseEvent<HTMLButtonElement>,
    bucketName: string,
  ) => void;
  handleConfirmDeletion: () => void;
  toast: any; // Chakra UI's toast function
  tableName: string;
  taskId: number;
  selectedBucket: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loadingDownloads: Record<string, boolean>;
}

const BucketCard: React.FC<BucketCardProps> = ({
  bucketName,
  data,
  handleCardClick,
  commentCounts,
  bucketComments,
  handleDownload,
  handleDelete,
  handleConfirmDeletion,
  toast,
  tableName,
  taskId,
  selectedBucket,
  isOpen,
  setIsOpen,
  loadingDownloads,
}) => {
  const { colorMode } = useColorMode();
  const cancelRef = useRef();
  const isDownloading = loadingDownloads[bucketName];

  const {
    columns = [],
    Pivot_Columns = [],
    Column_Inter_Dependency,
    Common_Null_Count,
    Uncommon_Null_Count,
  } = data[bucketName] || {};

  return (
    <Card
      key={bucketName}
      w="370px"
      h="auto"
      p={3}
      borderRadius="lg"
      boxShadow="lg"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      transition="transform 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        boxShadow: '0px 0px 15px rgba(0, 120, 255, 0.4)',
        cursor: 'pointer',
      }}
      onClick={() =>
        handleCardClick(
          bucketName,
          data[bucketName]?.columns || [],
          data[bucketName]?.Pivot_Columns || [],
          data[bucketName]?.Column_Inter_Dependency || [],
        )
      } // Pass Pivot_Columns here
    >
      <CardHeader pb={3} textAlign="center">
        <Heading
          size="md"
          color="blue.600"
          display="inline-flex"
          alignItems="center"
        >
          {bucketName}
          {Column_Inter_Dependency === 'Full' && (
            <FaCheckCircle color="#90EE90" style={{ marginLeft: '5px' }} />
          )}
        </Heading>

        <Box
          position="absolute"
          top={2}
          right={2}
          fontSize="lg"
          cursor="pointer"
        ></Box>

        <TableContainer mt={3}>
          <Tooltip
            hasArrow
            aria-label="Column Details"
            placement="right"
            fontSize="xl"
            pt={2}
            maxWidth="100vw"
            bg="white"
            color="black"
            label={
              <Box
                p={2}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                maxW="400px"
              >
                <BucketColumns
                  columns={columns}
                  Pivot_Columns={data[bucketName]?.Pivot_Columns || []}
                />
              </Box>
            }
          >
            <Box position="absolute" top={1} right={1} p={1} fontSize="xl">
              <FaInfoCircle />
            </Box>
          </Tooltip>

          <Table variant="simple" size="sm">
            <Tbody>
              <Tr>
                <Td fontWeight="bold">Column Inter-Dependency</Td>
                <Td textAlign="right">
                  {
                    typeof Column_Inter_Dependency === 'string'
                      ? // Check if the string can be parsed as a number
                      !isNaN(parseFloat(Column_Inter_Dependency))
                        ? // If it's a number (as string), truncate to two decimals
                        parseFloat(Column_Inter_Dependency)
                          .toString()
                          .slice(
                            0,
                            Column_Inter_Dependency.indexOf('.') + 3,
                          ) + '%' // Truncate after two decimal places
                        : // If it's not a number, display it as is (e.g., "Full", "Empty")
                        Column_Inter_Dependency
                      : // For numbers, truncate to two decimal places
                      parseFloat(Column_Inter_Dependency.toString())
                        .toString()
                        .slice(
                          0,
                          Column_Inter_Dependency.toString().indexOf('.') + 3,
                        ) + '%' // Truncate to two decimal places
                  }
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold">Columns</Td>
                <Td textAlign="right">{columns.length}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold">Common Null Count</Td>
                <Td textAlign="right">{Common_Null_Count ?? 'N/A'}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold">Uncommon Null Count</Td>
                <Td textAlign="right">
                  {Uncommon_Null_Count >= 0 ? Uncommon_Null_Count : ' '}
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold">Comments</Td>
                <Td textAlign="right">
                  {Column_Inter_Dependency === 'Full' ? 'N/A' : (
                    <Box display="flex" gap="10px" justifyContent="end">
                      {/* Comment Count */}
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        px="0.4rem"
                        py="0.1rem"
                        border="1px solid #ccc"
                        borderRadius="4px"
                        fontSize="0.9rem"
                        fontWeight="bold"
                        backgroundColor="gray.100"
                        color="black"
                        minWidth="24px"
                        textAlign="center"
                      >
                        {commentCounts?.[bucketName] || 0}
                      </Box>

                      <Popover trigger="click" placement="top">
                        <PopoverTrigger>
                          <Box
                            as="button"
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                              event.stopPropagation()} // Prevents card click
                          >
                            <GrTooltip
                              style={{
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#007bff',
                              }}
                            />
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent
                          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                            event.stopPropagation()}
                          bg="gray.100"
                          boxShadow="lg"
                          borderRadius="md"
                          p={3}
                          maxH="200px"
                          overflowY="auto"
                          maxWidth="1000px"
                          minW="200px"
                        >
                          <PopoverCloseButton color="black" />
                          <PopoverBody textAlign="left">
                            {bucketComments?.[bucketName]?.length > 0 ? (
                              <Box display="flex" flexDirection="column" gap={2}>
                                {bucketComments[bucketName]
                                  .filter((comment) => comment && comment.text)
                                  .map((comment, index) => (
                                    <Box key={index}>
                                      <Box
                                        fontSize="sm"
                                        color="black"
                                        maxWidth="100%"
                                        whiteSpace="normal"
                                        wordBreak="break-word"
                                      >
                                        <strong>{index + 1}.</strong>{' '}
                                        {comment?.text || 'No text available'}
                                      </Box>
                                      <Box fontSize="xs" color="gray.600">
                                        {comment?.['time-stamp']
                                          ? new Date(comment['time-stamp']).toLocaleString()
                                          : 'No timestamp'}
                                      </Box>
                                    </Box>
                                  ))}
                              </Box>
                            ) : (
                              <Box
                                textAlign="center"
                                fontSize="sm"
                                fontWeight="bold"
                                color="gray.600"
                              >
                                No comments available
                              </Box>
                            )}
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Box>
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </CardHeader>
      <Box position="absolute" top={2} left={2}>
        <Tooltip label="Click to download 100 samples" fontSize="sm" placement="top">
          {Common_Null_Count > 0 && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleDownload(tableName, taskId, bucketName, columns, toast);
              }}
              disabled={isDownloading} // Disable button while downloading
              style={{
                background: 'none',
                border: 'none',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
              }}
            >
              {isDownloading ? <Spinner size="sm" /> : <MdDownload size="1.5rem" />}
            </button>
          )}
        </Tooltip>
      </Box>
      <Box bottom={2} right={2} alignSelf={'end'}>
        <Tooltip label="Remove this cluster" fontSize="sm" placement="top">
          <button
            onClick={(event) => handleDelete(event, bucketName)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <MdDelete size="1.5rem" />
          </button>
        </Tooltip>
      </Box>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Confirm Deletion
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the cluster `{selectedBucket}` ?
            Once deleted, it cannot be restored.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDeletion} ml={3}>
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BucketCard;
