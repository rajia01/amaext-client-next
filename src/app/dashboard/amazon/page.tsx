'use client';

import React, { useState, useEffect, useContext } from 'react';
import {
  Flex,
  Box,
  Text,
  Divider,
  SimpleGrid,
  Heading,
  CardHeader,
  CardBody,
  Card,
  Stack,
  useColorModeValue,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  // Tabs,
  // TabList,
  // Tab,
  TabIndicator,
  // TabPanels,
  // TabPanel,
  Tooltip,
  Skeleton,
  Button,
  Input,
  FormControl,
  FormLabel,
  Icon,
  useQuery,
  HStack,
  Spacer,
  StatGroup,
  StatLabel,
  Stat,
  StatNumber,
  Tfoot,
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { IoMdDownload } from "react-icons/io";
import Select from 'react-select';
import axios, { AxiosError } from 'axios';
import { BACKEND_DOMAIN, token } from '../../../../urls';
import { saveAs } from 'file-saver';
import { convertToCSV } from 'utils/converttocsv';
import { TaskContext } from 'contexts/TaskId';
import GeneralCard from 'components/card/GeneralCard';


interface MissedCountType {
  [key: string]: number | string;
}


interface CountDataType {
  product?: {
    product_total_count?: number[];
    product_success_count?: number[];
    product_processed_count?: number[];
    product_pending_count?: number[];
    product_missed_count?: [number, MissedCountType];
  };
  list?: {
    list_total_count?: number[];
    list_success_count?: number[];
    list_processed_count?: number[];
    list_pending_count?: number[];
    list_missed_count?: [number, MissedCountType];
  };
  seller?: {
    seller_total_count?: number[];
    seller_success_count?: number[];
    seller_processed_count?: number[];
    seller_pending_count?: number[];
    seller_missed_count?: [number, MissedCountType];
  };
}


const Default: React.FC = () => {
  const [tableloading, setTableLoading] = useState(false);
  const [dropdownloading, setDropdownLoading] = useState(false);
  const [taskId, setTaskId] = useState<number | null>(null);
  const { setTaskid } = useContext(TaskContext);

  const [countData, setCountData] = useState<CountDataType>({
    product: {
      product_total_count: [0, 0],
      product_success_count: [0, 0],
      product_processed_count: [0, 0],
      product_pending_count: [0, 0],
      product_missed_count: [0, {}]
    },
    list: {
      list_total_count: [0, 0],
      list_success_count: [0, 0],
      list_processed_count: [0, 0],
      list_pending_count: [0, 0],
      list_missed_count: [0, {}]
    },
    seller: {
      seller_total_count: [0, 0],
      seller_success_count: [0, 0],
      seller_processed_count: [0, 0],
      seller_pending_count: [0, 0],
      seller_missed_count: [0, {}]
    }
  });
  const [dropdownDataCategory, setDropdownDataCategory] = useState([]);
  const [dropdownDataSubCategory, setDropdownDataSubCategory] = useState([]);
  const [dropdownDataDatapoints, setDropdownDataDatapoints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedDatapoints, setSelectedDatapoints] = useState([]);
  const [dropdownDataCity, setDropdownDataCity] = useState([]);
  const [dropdownDataCountry, setDropdownDataCountry] = useState([]);
  const [dropdownDataState, setDropdownDataState] = useState([]);
  const [selectedCity, setSelectedCity] = useState([])
  const [selectedState, setSelectedState] = useState([])
  const [selectedCountry, setSelectedCountry] = useState([])
  const [amazonProductData, setAmazonsProductData] = useState([]);
  const [amazonListData, setAmazonsListData] = useState([]);
  const [amazonSellerData, setAmazonsSellerData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const textColor = useColorModeValue('navy.700', 'white');

  const seller_data = amazonSellerData
  const toast = useToast();

  const convertToOptions = (items: string[] | undefined) =>
    items?.map(item => ({ value: item, label: item })) || [];


  useEffect(() => {
    if (taskId !== null) {
      fetchApiData(taskId);
    }
  }, [selectedCategory, selectedSubCategory, selectedDatapoints, activeTab, selectedCity, selectedState, selectedCountry]);


  const fetchApiData = async (task_id: number | null) => {
    setTableLoading(true);
    try {
      if (!task_id) throw new Error("Task ID not found");

      let tableName = ''

      const formData = new FormData();
      formData.append('task_id', task_id.toString());
      setTaskid((prev) => {
        return {
          ...prev,
          task_id: task_id
        }
      });

      if (activeTab == 1) {
        tableName = 'PRODUCT_DETAIL_DATA'
      }
      else if (activeTab == 2) {
        tableName = 'SELLER_DATA'
      }
      else {
        tableName = 'PRODUCT_LIST_DATA'
      }
      console.log(tableName);
      formData.append('table_name', tableName);

      if (selectedCategory) {
        formData.append('mapped_category', selectedCategory.join(','));
      }

      if (selectedSubCategory) {
        formData.append('sub_category', selectedSubCategory.join(','));
      }

      if (selectedDatapoints) {
        formData.append('datapoints', selectedDatapoints.join(','));
      }

      if (selectedCity) {
        formData.append('city', selectedCity.join(','))
      }

      if (selectedState) {
        formData.append('state', selectedState.join(','))
      }

      if (selectedCountry) {
        formData.append('country', selectedCountry.join(','))
      }

      console.log(formData);

      const response = await fetch(
        `${BACKEND_DOMAIN}/plugin_insights/`,
        {
          method: 'POST',
          headers: {
            Authorization: token,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('i am data', data.data_count);
      setCountData(data.data_count);
      activeTab == 0 ? setAmazonsListData(data.data) : activeTab == 1 ? setAmazonsProductData(data.data) : setAmazonsSellerData(data.data);
      if (activeTab == 1) {
        toast({
          title: "Success",
          description: "Datapoints fetched successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }
      toast({
        title: "Success",
        description: "Data fetched successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      setCountData({})
      if (activeTab == 0) setAmazonsListData([]);
      else if (activeTab == 1) setAmazonsProductData([]);
      else setAmazonsSellerData([]);
      toast({
        title: "Error",
        description: error.toString(),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTableLoading(false);
    }
  };

  const downloadData = (task_id: number) => {
    if (!task_id) throw new Error("Please Mention the Task ID");
    try {
      const csvData = convertToCSV(seller_data)
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `seller_details${task_id}.csv`);
    }
    catch (error: any) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const fetchdropDownData = async (task_id: number) => {
    setDropdownLoading(true);
    try {
      if (!task_id) throw new Error("Task ID not found");
      const filter_table_data = activeTab == 1 ? 'PRODUCT_DETAIL_DATA' : activeTab == 2 ? 'SELLER_DATA' : 'PRODUCT_LIST_DATA'
      const response = await axios.get(
        `${BACKEND_DOMAIN}/get-data/?task_id=${task_id}&table_name=${filter_table_data}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: token,
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const data = response.data.data;

      if (data) {
        if (data.category) setDropdownDataCategory(data.category);
        if (data.sub_category) setDropdownDataSubCategory(data.sub_category);
        if (data.datapoints) setDropdownDataDatapoints(data.datapoints);
        if (data.city) setDropdownDataCity(data.city);
        if (data.state) setDropdownDataState(data.state);
        if (data.country) setDropdownDataCountry(data.country);
      }
      toast({
        title: "Success",
        description: "Dropdown Data fetched successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    }
    catch (error: any) {
      setDropdownDataCategory([]);
      setDropdownDataSubCategory([]);
      setDropdownDataDatapoints([]);
      setDropdownDataCity([]);
      setDropdownDataState([]);
      setDropdownDataCountry([]);
      toast({
        title: "Error",
        description: error.toString(),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    finally {
      setDropdownLoading(false);
    }
  }


  useEffect(() => {
    if (taskId != null) {
      fetchdropDownData(taskId)
    }
  }, [activeTab])



  const get_skeleton = (type: string) => {
    if (type === 'stats') {
      return (
        <Skeleton height="25px" mb={2} />
      );
    } else if (type === 'dropdown') {
      return (
        <Skeleton height='50px' mb={2} rounded={"md"} />
      );
    }
    else {
      return (
        <Tr>
          <Td colSpan={5}>
            <Skeleton height='30px' mb={2} rounded={"md"} w={'100%'} />
            <Skeleton height='30px' mb={2} rounded={"md"} w={'100%'} />
            <Skeleton height='30px' mb={2} rounded={"md"} w={'100%'} />
            <Skeleton height='30px' mb={2} rounded={"md"} w={'100%'} />
            <Skeleton height='30px' mb={2} rounded={"md"} w={'100%'} />
          </Td>
        </Tr>
      );
    }
  };



  const dividerColor = useColorModeValue("pink.600", "pink.300");
  const hasTaskId = taskId !== null && taskId.toString() !== '';

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const renderTable = (
    data: any[],
    config: {
      columns: string[],
      headers: string[]
    },
    category?: string[],
    subCategory?: string[],
    country?: string[],
    state?: string[],
    city?: string[],
    activeTab?: number) =>


  (
    
    <Box
      maxHeight="406px"
      maxWidth="full"
      overflowY="auto"
      overflowX="auto"
      border="2px solid"
      borderColor="gray.300"
      rounded="lg"
      position="relative"
    >
      <Table>
        <Thead position="sticky" top="0" zIndex="1" bg={"#2D3748"}>
          {dropdownloading ? get_skeleton('dropdown') :
            <Tr>
              {config.headers.map((header, index) => (
                <Th key={index} width="200px">
                  <HStack justifyContent={"center"} align="center" bg={"#2D3748"}>
                    <span>{header}</span>
                    {header === "Category" && activeTab !== 2 && (
                      <Select
                        options={convertToOptions(category)}
                        isMulti
                        value={selectedCategory.map((cat) => ({ value: cat, label: cat }))}
                        onChange={(selectedOptions: any) =>
                          setSelectedCategory(selectedOptions.map((option: any) => option.value))
                        }
                        placeholder="Select Categories"
                        styles={{
                          control: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: "black",
                          }),
                          option: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor,
                          }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )}
                    {header === "Sub-Category" && activeTab !== 2 && (
                      <Select
                        options={convertToOptions(subCategory)}
                        isMulti
                        value={selectedSubCategory.map((cat) => ({ value: cat, label: cat }))}
                        onChange={(selectedOptions: any) =>
                          setSelectedSubCategory(selectedOptions.map((option: any) => option.value))
                        }
                        placeholder="Select Sub-Categories"
                        className="w-[100px]"
                        styles={{
                          control: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor, 
                          }),
                          option: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor,
                          }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )}
                    {header === "City" && (
                      <Select
                        options={convertToOptions(city)}
                        isMulti
                        value={selectedCity.map((cat) => ({ value: cat, label: cat }))}
                        onChange={(selectedOptions: any) =>
                          setSelectedCity(selectedOptions.map((option: any) => option.value))
                        }
                        placeholder="Select City"
                        className="w-[100px]"
                        styles={{
                          control: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748", 
                            color: textColor,
                          }),
                          option: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor, 
                          }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )}
                    {header === "State" && (
                      <Select
                        options={convertToOptions(state)}
                        isMulti
                        value={selectedState.map((cat) => ({ value: cat, label: cat }))}
                        onChange={(selectedOptions: any) =>
                          setSelectedState(selectedOptions.map((option: any) => option.value))
                        }
                        placeholder="Select State"
                        className="w-[100px]"
                        styles={{
                          control: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748", 
                            color: textColor,
                          }),
                          option: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor, 
                          }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )}
                    {header === "Country" && (
                      <Select
                        options={convertToOptions(country)}
                        isMulti
                        value={selectedCountry.map((cat) => ({ value: cat, label: cat }))}
                        onChange={(selectedOptions: any) =>
                          setSelectedCountry(selectedOptions.map((option: any) => option.value))
                        }
                        placeholder="Select Country"
                        className="w-[200px]"
                        styles={{
                          control: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor, 
                          }),
                          option: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor, 
                          }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )}
                  </HStack>
                </Th>
              ))}
            </Tr>
          }
        </Thead>
        {tableloading ? (
          <>
            {Array.from({ length: 2 }).map((_, index) => (
              get_skeleton('table')
            ))}
          </>
        ) : (
          <>
            <Tbody>
              {data?.map((row, index) => (
                <Tr key={index}>
                  {config.columns.map((column, index1) => (
                    <Td key={index1} textAlign="center" color={textColor} >
                      {column === 'id' ? index + 1 : row[column]}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
            <Tfoot position="sticky" bottom="0" zIndex="1" bg={"#2D3748"}>
              <Tr>
                <Td colSpan={config.columns.length} textAlign="end" pl={12} fontWeight={'bold'}>
                  Total Count: {data?.reduce((acc, row) => acc + row.total_counts, 0)}
                </Td>
              </Tr>
            </Tfoot>
          </>
        )}
      </Table>
    </Box>

  );


  return (
    <Stack 
      direction={{ base: "column" }} // Responsive direction
      spacing={4}
      alignItems="center"
      justifyContent="center"
      width="full"
    >
      <Flex
        direction={{ base: "row" }} // Responsive direction
        gap={4}
        alignItems="center"
        justifyContent="center"
        width="full">
        <Stack
          direction="column"
          spacing={5}
          alignItems="center"
          flex="0.5" // Allow responsive width allocation
        >
          <FormControl isRequired>
            <Box position="relative">
              <Input
                id="task-id"
                type="number"
                value={taskId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setTaskId(value === "" ? null : Number(value));
                }}
                placeholder=" "
                color={textColor}
                _focus={{ borderColor: "blue.400" }}
                _hover={{ borderColor: "blue.300" }}
              />
              <FormLabel
                position="absolute"
                top={hasTaskId ? "-6px" : "50%"}
                px={2}
                color={hasTaskId ? textColor : "gray.500"}
                fontWeight={hasTaskId ? "bold" : "normal"}
                fontSize={hasTaskId ? "sm" : "md"}
                transform={
                  hasTaskId
                    ? "translateY(-100%) translateX(-15%)"
                    : "translateY(-50%)"
                }
                transition="all 0.2s ease-in-out"
              >
                Task ID
              </FormLabel>
            </Box>
          </FormControl>
          <Button
            bg="#01B574"
            onClick={() => [fetchApiData(taskId), fetchdropDownData(taskId)]}
          >
            Fetch Counts
          </Button>
        </Stack>
        <Stack
          direction="column"
          flex="2.5" // Allow responsive width allocation
          width="full"
          alignItems="center"
        >
          <Card
            width="full"
            bg="#ffffff1a"
            brightness={0.2}
            mt={4}
            borderRadius="2px"
            height="auto"
            overflowY="hidden"
            rounded={"xl"}
            p={4}
          >
                <SimpleGrid display="flex" flexDirection={"row"} gap={3} columns={{ base: 1, md: 2 }}>
                    <Card w="full" bg="#111C44">
                      <CardHeader p="4">
                        <Heading
                          textAlign="start"
                          fontWeight="bold"
                          fontSize={{ base: "md", md: "lg" }}
                          color={textColor}>Amazon Product List
                        </Heading>
                        <Box mt="3" textAlign={"center"}>
                          <StatGroup>
                            <Stat>
                              <Text color={textColor}>Total</Text>
                              <StatNumber
                                fontSize={{ base: "md", md: "lg" }}
                              >
                                <Tooltip
                                  fontSize={"18px"} hasArrow placement='right-end' label={countData.list?.list_total_count[1]} aria-label="Total list count tooltip">
                                  <span>
                                    {tableloading ? get_skeleton('stats') : countData.list?.list_total_count[0]}
                                  </span>
                                </Tooltip>
                              </StatNumber>
                            </Stat>
                            <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                            <Stat>
                              <Text color={textColor}>Extracted Data</Text>
                              <StatNumber
                                fontSize={{ base: "md", md: "lg" }}
                              >
                                <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.list?.list_success_count[1]} aria-label="Total list Extracted Data tooltip">
                                  <span>
                                    {tableloading ? get_skeleton('stats') : countData.list?.list_success_count[0]}
                                  </span>
                                </Tooltip>
                              </StatNumber>
                            </Stat>
                          </StatGroup>
                        </Box>
                      </CardHeader>
                      <Divider color={dividerColor} borderWidth="1px" width="90%" mx="auto" />
                      <CardBody p="3" textAlign={"center"}>
                        <StatGroup>
                          <Stat>
                            <Text color={textColor}>Processed</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.list?.list_processed_count[1]} aria-label="Total list processed tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.list?.list_processed_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                          <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                          <Stat>
                            <Text color={textColor}>Pending</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.list?.list_pending_count[1]} aria-label="Total list pending tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.list?.list_pending_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                          <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                          <Stat>
                            <Text color={textColor}>Missed</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={`Attempt - 0:${countData.list?.list_missed_count[1][0] !== undefined ? countData.list?.list_missed_count[1][0] : 0} | 1:${countData.list?.list_missed_count[1][1] !== undefined ? countData.list?.list_missed_count[1][1] : 0} | 2:${countData.list?.list_missed_count[1][2] !== undefined ? countData.list?.list_missed_count[1][2] : 0} | 3:${countData.list?.list_missed_count[1][3] !== undefined ? countData.list?.list_missed_count[1][3] : 0}`} aria-label="Total list missed tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.list?.list_missed_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                        </StatGroup>
                      </CardBody>
                    </Card>

                    <Card w="full" bg="#111C44">
                      <CardHeader p="4">
                        <Heading
                          textAlign="start"
                          fontWeight="bold"
                          fontSize={{ base: "sm", md: "lg" }}
                          color={textColor}>Amazon Product Details
                        </Heading>
                        <Box mt="3" textAlign={"center"}>
                          <StatGroup>
                            <Stat>
                              <Text color={textColor}>Total</Text>
                              <StatNumber
                                fontSize={{ base: "md", md: "lg" }}
                              >
                                <Tooltip fontSize={"18px"}
                                  hasArrow

                                  placement='right-end'
                                  label={countData.product?.product_total_count[1]}
                                  aria-label="Total product count tooltip"
                                >
                                  <span>
                                    {tableloading ? get_skeleton('stats') : countData.product?.product_total_count[0]}
                                  </span>
                                </Tooltip>
                              </StatNumber>
                            </Stat>
                            <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                            <Stat>
                              <Text color={textColor}>Extracted Data</Text>
                              <StatNumber
                                fontSize={{ base: "md", md: "lg" }}
                              >
                                <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.product?.product_success_count[1]} aria-label="Total Extracted Data tooltip">
                                  <span>
                                    {tableloading ? get_skeleton('stats') : countData.product?.product_success_count[0]}
                                  </span>
                                </Tooltip>
                              </StatNumber>
                            </Stat>
                          </StatGroup>
                        </Box>
                      </CardHeader>
                      <Divider color={dividerColor} borderWidth="1px" width="90%" mx="auto" />
                      <CardBody p="3" textAlign={"center"}>
                        <StatGroup>
                          <Stat>
                            <Text color={textColor}>Processed</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.product?.product_processed_count[1]} aria-label="Total processed tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.product?.product_processed_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                          <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                          <Stat>
                            <Text color={textColor}>Pending</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.product?.product_pending_count[1]} aria-label="Total pending tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.product?.product_pending_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                          <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                          <Stat>
                            <Text color={textColor}>Missed</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={`Attempt - 0:${countData.product?.product_missed_count[1][0] !== undefined ? countData.product?.product_missed_count[1][0] : 0} | 1:${countData.product?.product_missed_count[1][1] !== undefined ? countData.product?.product_missed_count[1][1] : 0} | 2:${countData.product?.product_missed_count[1][2] !== undefined ? countData.product?.product_missed_count[1][2] : 0} | 3:${countData.product?.product_missed_count[1][3] !== undefined ? countData.product?.product_missed_count[1][3] : 0}`} aria-label="Total missed tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.product?.product_missed_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                        </StatGroup>
                      </CardBody>
                    </Card>

                    <Card w="full" bg="#111C44">
                      <CardHeader p="4">
                        <Heading
                          textAlign="start"
                          fontWeight="bold"
                          fontSize={{ base: "md", md: "lg" }}
                          color={textColor}>Amazon Seller Details
                        </Heading>
                        <Box mt="3" textAlign={"center"}>
                          <StatGroup >
                            <Stat>
                              <Text color={textColor}>Total</Text>
                              <StatNumber
                                fontSize={{ base: "md", md: "lg" }}
                              >
                                <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.seller?.seller_total_count[1]} aria-label="Total seller count tooltip">
                                  <span>
                                    {tableloading ? get_skeleton('stats') : countData.seller?.seller_total_count[0]}
                                  </span>
                                </Tooltip>
                              </StatNumber>
                            </Stat>
                            <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                            <Stat>
                              <Text color={textColor}>Extracted Data</Text>
                              <StatNumber
                                fontSize={{ base: "md", md: "lg" }}
                              >
                                <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.seller?.seller_success_count[1]} aria-label="Total seller Extracted Data tooltip">
                                  <span>
                                    {tableloading ? get_skeleton('stats') : countData.seller?.seller_success_count[0]}
                                  </span>
                                </Tooltip>
                              </StatNumber>
                            </Stat>
                          </StatGroup>
                        </Box>
                      </CardHeader>
                      <Divider color={dividerColor} borderWidth="1px" width="90%" mx="auto" />
                      <CardBody p="3" textAlign={"center"}>
                        <StatGroup>
                          <Stat>
                            <Text color={textColor}>Processed</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.seller?.seller_processed_count[1]} aria-label="Total seller processed tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.seller?.seller_processed_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                          <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                          <Stat>
                            <Text color={textColor}>Pending</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={countData.seller?.seller_pending_count[1]} aria-label="Total seller pending tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.seller?.seller_pending_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                          <Divider borderColor="gray.400" borderWidth="1px" height="45px" orientation="vertical" mx={2} />
                          <Stat>
                            <Text color={textColor}>Missed</Text>
                            <StatNumber
                              fontSize={{ base: "md", md: "lg" }}
                            >
                              <Tooltip fontSize={"18px"} hasArrow placement='right-end' label={`Attempt - 0:${countData.seller?.seller_missed_count[1][0] !== undefined ? countData.seller?.seller_missed_count[1][0] : 0} | 1:${countData.seller?.seller_missed_count[1][1] !== undefined ? countData.seller?.seller_missed_count[1][1] : 0} | 2:${countData.seller?.seller_missed_count[1][2] !== undefined ? countData.seller?.seller_missed_count[1][2] : 0} | 3:${countData.seller?.seller_missed_count[1][3] !== undefined ? countData.seller?.seller_missed_count[1][3] : 0}`} aria-label="Total seller missed tooltip">
                                <span>
                                  {tableloading ? get_skeleton('stats') : countData.seller?.seller_missed_count[0]}
                                </span>
                              </Tooltip>
                            </StatNumber>
                          </Stat>
                        </StatGroup>
                      </CardBody>
                    </Card>
                </SimpleGrid>
          </Card>
        </Stack>
      </Flex>

      <Flex mt={2} direction="row" align="flex-start" flexWrap="wrap" width={"100%"}>
            {taskId ? (<Box 
              flex="1"
              flexWrap="wrap"
              >
              <Tabs variant="solid-rounded" position='relative' flexWrap="wrap" onChange={handleTabChange} isLazy>
              <TabList flexWrap="wrap">
                  <Tab>
                    Amazon Product Lists {activeTab === 0 && <Text as="span" fontSize="sm"></Text>}
                  </Tab>
                  <Tab>
                    Amazon Product Details {activeTab === 1 && <Text as="span" fontSize="sm"></Text>}
                  </Tab>
                  <Tab>
                    Amazon Seller Details {activeTab === 2 && <Text as="span" fontSize="sm"></Text>}
                  </Tab>
                  <Spacer className='gap-2'/>
                  {
                    (
                      activeTab==2 
                      &&
                      <Box 
                        display={'flex'} 
                        bg={'green.500'}
                        rounded={'full'}
                        width={'60px'}
                        fontWeight={'bold'} 
                        alignItems={'center'}
                        >
                        
                        <Icon
                            h="30px"
                            w="30px"
                            mx={"auto"}
                            justifyContent={"center"}
                            as={IoMdDownload}
                            cursor={'pointer'}
                            color={'white'}
                            onClick={()=> downloadData(taskId)}
                            >
                        </Icon>
                      </Box>
                    )
                    ||
                    (
                      activeTab==1 
                      &&
                      <Select
                        options={convertToOptions(dropdownDataDatapoints)}
                        isMulti
                        value={selectedDatapoints.map((cat) => ({ value: cat, label: cat }))}
                        onChange={(selectedOptions: any) =>
                          setSelectedDatapoints(selectedOptions.map((option: any) => option.value))
                        }
                        placeholder="Select Datapoints"
                        className="w-[100px]"
                        styles={{
                          control: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748", 
                            color: textColor,
                          }),
                          option: (base:any) => ({
                            ...base,
                            backgroundColor: "#2D3748",
                            color: textColor, 
                          }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )
                  }
              </TabList>
              {/* <TabIndicator mt='-1.5px' height='2px' bg='blue.500' borderRadius='1px' /> */}
                <TabPanels>
                  <TabPanel>
                    {renderTable(amazonListData, {
                        columns: ["id","mapped_category", "sub_category", "total_counts"],
                        headers: ["id","Category", "Sub-Category", "Count"]},
                        dropdownDataCategory,
                        dropdownDataSubCategory,
                        null,
                        null,
                        null,
                        activeTab
                    )}
                  </TabPanel>
                  <TabPanel>
                    {renderTable(amazonProductData, {
                        columns: ["id","mapped_category", "sub_category", "total_counts"],
                        headers: ["id","Category", "Sub-Category", "Count"]},
                        dropdownDataCategory,
                        dropdownDataSubCategory,
                        dropdownDataDatapoints,
                        null,
                        null,
                        activeTab
                      )
                    }
                  </TabPanel>
                  <TabPanel>
                    {renderTable(amazonSellerData, {
                      columns: ["id","city", "state", "country", "total_counts"],
                      headers: ["id","City", "State", "Country", "Count"]},
                      null,
                      null,
                      dropdownDataCountry,
                      dropdownDataState,
                      dropdownDataCity,
                      activeTab
                    )
                    }
                  </TabPanel>
                </TabPanels>
                {/* } */}
              </Tabs>
            </Box>): null}
      </Flex>
    </Stack>
    
  )
};


export default Default;