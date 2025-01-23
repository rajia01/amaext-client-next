"use client"
import { useState } from "react";
import { 
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  useToast,
  Box,
  Card,
  Skeleton, Stack, Tab, TabList, TabPanel, TabPanels, Tabs,
  Text, 
  Spacer,
  FormControl,
  Input,
  FormLabel,
  Button,
  useColorModeValue,
  Flex,
  Tooltip,
  Switch,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getAllAmazonProductDetails } from "utils/api/amazon";
import JsonTreeDisplay from "components/jsonTree/jsonTree";
import axios from "axios";
import { BACKEND_DOMAIN, token } from "../../../../../urls";


export default function AmazonInsights() {
    const [activeTab, setActiveTab] = useState(0);
    const [taskId, setTaskId] = useState<number | null>(null);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const textColor = useColorModeValue('navy.700', 'white');
    const toast = useToast();
    const colors = [
      useColorModeValue('red.400', 'red.500'),
      useColorModeValue('gray.300', 'gray.600'),
      useColorModeValue('yellow.300', 'yellow.500'),
      useColorModeValue('green.300', 'green.500'),
      useColorModeValue('purple.300', 'purple.600'),
    ]


    const {
      data: amazonList,
      error,
      isLoading,
      isSuccess,
      refetch
    } = useQuery({
      queryKey: ['dataAmazon', taskId, isChecked],
      queryFn: () => getAllAmazonProductDetails(taskId, isChecked),
      enabled: false
    });

  
    if (isLoading) {
      return (
        <Stack 
        direction={{ base: "column", md: "row" }} 
        spacing={4} 
        align="center" 
        wrap="wrap"
        width="full"
      >
      <Flex 
        direction="row" 
        wrap="wrap" 
        gap={4} 
        justify="space-between" 
        width="full"
      >
      <Flex gap={4}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton 
            borderRadius="2xl" 
            key={index} 
            width={{ base: "full", sm: "250px" }} 
            height="40px"
          >
            <Flex align="center" gap={1}>
              <Box width="full" height="30px" borderRadius="full" />
            </Flex>
          </Skeleton>
        ))}
      </Flex>

        <Skeleton 
          height="40px" 
          width={{ base: "full", sm: "250px" }} 
          alignSelf="flex-end"
        >
          <Flex justifyContent={"end"}>
            <Box bg="gray.100" borderRadius="3xl" width="full" height="full" />
          </Flex>
        </Skeleton>
      </Flex>
        <Skeleton 
          borderRadius="30px" 
          height="150px" 
          width={{ base: "full", md: "full" }}
          mt={{ base: 4, md: 0 }}
        >
          <Card
            width="full"
            bg="#ffffff1a"
            height="200px"
          />
        </Skeleton>
      </Stack>
      

      );
    }

  
    if (error) {
      toast.closeAll();
      toast({
          title: "Error",
          description: error?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
      });
      return null
    }

    if (amazonList?.data?.length > 0 && isSuccess) {
      toast.closeAll();
      toast({
          title: "Success",
          description: "Insights Fetched Successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
      });
  } else if (amazonList?.error) {
      // console.log("Error:", amazonList?.error);
      toast.closeAll();
      toast({
          title: "Error",
          description: amazonList?.error || "Failed to fetch insights",
          status: "error",
          duration: 5000,
          isClosable: true,
      });
  }
  

    const fetchInsightsData = async (task_id: number | null, refresh: boolean) => {
      try {
        if (!task_id) throw new Error("Task ID not found");
        refetch();
      } catch (error:any) {
        toast.closeAll();
        toast({
          title: "Error",
          description: error?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // const handleRefresh = async(task_id: number | null) => {
    //   try {
    //     if (!task_id) throw new Error("Please Enter Task ID");
    //     toast({
    //       id: `Refreshing Data for task_id - ${task_id}`,
    //       title: "Loading",
    //       description: `Refreshing data for task_id - ${task_id}...`,
    //       status: "loading",
    //       duration: null, 
    //       isClosable: false,
    //     });
    //     const response = await axios.get(`${BACKEND_DOMAIN}/refresh-task/?task_id=${task_id}`, 
    //       {
    //         headers: {
    //           "Content-Type": "application/x-www-form-urlencoded",
    //           Authorization: token,
    //         },
    //       }
    //     )

        
    //     if (response.status==200) {
    //       console.log("i am response");
    //       toast.close(`Refreshing Data for-${task_id}`);
    //       fetchInsightsData(task_id,isChecked);
    //     } 
    //   }catch (error) {
    //     toast.closeAll();
    //     toast({
    //         title: "Error",
    //         description: `Error: ${error}`,
    //         status: "error",
    //         duration: 3000,
    //         isClosable: true,
    //     });        
    //   }
    // }


    return (
      <>
      <Tabs variant='soft-rounded'>
        <TabList>
          <Tab>
            Amazon Product Lists {activeTab === 0 && <Text as="span" fontSize="sm"></Text>}
          </Tab>
          <Tab>
            Amazon Product Details {activeTab === 1 && <Text as="span" fontSize="sm"></Text>}
          </Tab>
          <Tab>
            Amazon Seller Details {activeTab === 2 && <Text as="span" fontSize="sm"></Text>}
          </Tab>
          <Spacer/>
          {/* <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          flex="0.5"
        >
         <FormControl isRequired>
            <Flex alignItems="center" gap={4}> 
              <Box position="relative" flex="1">
                <Input
                  id="task-id"
                  type="number"
                  value={taskId ?? ""}
                  placeholder=" "
                  onChange={(e) => {
                    const value = e.target.value;
                    setTaskId(value === "" ? null : Number(value));
                  }}
                  color={textColor}
                  width={"90"}
                  _focus={{ borderColor: "blue.400" }}
                  _hover={{ borderColor: "blue.300" }}
                />
                <FormLabel
                  htmlFor="task-id"
                  position="absolute"
                  top={taskId ? "-6px" : "50%"}
                  left={2}
                  px={1}
                  color={taskId ? textColor : "gray.500"}
                  fontWeight={taskId ? "bold" : "normal"}
                  fontSize={taskId ? "sm" : "md"}
                  transform={taskId ? "translateX(calc(-130%)) translateY(80%)" : "translateY(-50%)"}
                  transition="all 0.2s ease-in-out"
                  pointerEvents="none"
                >
                  Task ID
                </FormLabel>
              </Box>
              <Switch 
                id="refresh-alerts" 
                size="lg"
                isChecked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}   
              />
            </Flex>
          </FormControl>

          <Button
            bg="#01B574"
            onClick={() => fetchInsightsData(taskId, isChecked)}
          >Fetch</Button>
        </Stack> */}

              <Stack
                direction={{ base: "column", md: "row" }} // Stack direction changes based on screen size
                spacing={{ base: 2, md: 3 }} // Adjust spacing for smaller screens
                alignItems="center"
                flex={{ base: "1", md: "0.5" }} // Adjust flex size
                width="100%" // Ensure it spans the available width
              >
                <FormControl isRequired>
                  <Flex 
                    alignItems="center" 
                    gap={{ base: 2, md: 4 }} // Adjust gap based on screen size
                    direction={{ base: "column", md: "row" }} // Change direction on smaller screens
                  >
                    <Box position="relative" flex="1" width="100%">
                      <Input
                        id="task-id"
                        type="number"
                        value={taskId ?? ""}
                        placeholder=" "
                        onChange={(e) => {
                          const value = e.target.value;
                          setTaskId(value === "" ? null : Number(value));
                        }}
                        color={textColor}
                        width="100%" // Full width for better responsiveness
                        _focus={{ borderColor: "blue.400" }}
                        _hover={{ borderColor: "blue.300" }}
                      />
                      <FormLabel
                        htmlFor="task-id"
                        position="absolute"
                        top={taskId ? "-6px" : "50%"}
                        left={2}
                        px={1}
                        color={taskId ? textColor : "gray.500"}
                        fontWeight={taskId ? "bold" : "normal"}
                        fontSize={taskId ? "sm" : "md"}
                        transform={taskId ? "translateX(calc(-130%)) translateY(80%)" : "translateY(-50%)"}
                        transition="all 0.2s ease-in-out"
                        pointerEvents="none"
                      >
                        Task ID
                      </FormLabel>
                    </Box>
                    <Switch
                      id="refresh-alerts"
                      size="lg"
                      isChecked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                  </Flex>
                </FormControl>

                <Button
                  bg="#01B574"
                  width={{ base: "100%", md: "auto" }} // Full width on smaller screens
                  onClick={() => fetchInsightsData(taskId, isChecked)}
                >
                  Fetch
                </Button>
              </Stack>


                </TabList>

                <TabPanels>
                  <TabPanel>
                      <Card
                          width={'full'}
                          bg={'#ffffff1a'}
                          brightness={0.2}
                          mt={4}
                          borderRadius={'20px'}
                        >
                        <Stack>
                          <Accordion
                            width={'full'}
                            borderColor={'transparent'}
                            allowMultiple
                            defaultIndex={[0]}
                          >
                            <AccordionItem>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <AccordionIcon />
                                </Box>
                                <Flex justifyContent={'end'} align="center" gap={2}>
                                    <Text color={colors[0]} fontSize={'md'} fontWeight={'bold'}>Amz</Text>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Amazon,</Text>
                                    <Text color={colors[0]} fontSize={'md'} fontWeight={'bold'}>Ip</Text>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Input,</Text>
                                    <Tooltip
                                      hasArrow
                                      aria-label="A updated time tooltip"
                                      label={
                                        amazonList?.data && Array.isArray(amazonList.data) && amazonList.data[3]?.modified_date
                                          ? `Summary Last Generated at: ${new Date(
                                              new Date(`${amazonList.data[3].modified_date}`).toLocaleString(
                                                "en-US",
                                                {
                                                  timeZone: "Asia/Kolkata",
                                                }
                                              )
                                            ).toString()}`
                                          : amazonList?.error
                                          ? amazonList.error // Show the error message from the backend
                                          : "No data available"
                                      }
                                      placement="right"
                                      fontSize="xl"
                                      pt={2}
                                    >
                                      <Text color={colors[0]} fontSize="md" fontWeight="bold">
                                        Ext
                                      </Text>
                                    </Tooltip>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Extracted</Text>
                                </Flex>
                                </AccordionButton>
                                <AccordionPanel>
                                    <JsonTreeDisplay json={amazonList?.data[0]} />
                                </AccordionPanel>
                              </AccordionItem>
                          </Accordion>
                        </Stack>
                      </Card>  
                    </TabPanel>
                      <TabPanel>
                        <Card
                          width={'full'}
                          bg={'#ffffff1a'}
                          brightness={0.2}
                          mt={4}
                          borderRadius={'20px'}
                        >
                        <Stack>
                          <Accordion
                            width={'full'}
                            borderColor={'transparent'}
                            allowMultiple
                            defaultIndex={[0]}
                          >
                            <AccordionItem>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <AccordionIcon />
                                </Box>
                                <Flex justifyContent={'end'} align="center" gap={2}>
                                    <Text color={colors[0]} fontSize={'md'} fontWeight={'bold'}>Amz</Text>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Amazon,</Text>
                                    <Text color={colors[0]} fontSize={'md'} fontWeight={'bold'}>Ip</Text>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Input,</Text>
                                    <Tooltip
                                      hasArrow
                                      aria-label="A updated time tooltip"
                                      label={
                                        amazonList?.data && Array.isArray(amazonList.data) && amazonList.data[3]?.modified_date
                                          ? `Summary Last Generated at: ${new Date(
                                              new Date(`${amazonList.data[3].modified_date}`).toLocaleString(
                                                "en-US",
                                                {
                                                  timeZone: "Asia/Kolkata",
                                                }
                                              )
                                            ).toString()}`
                                          : amazonList?.error
                                          ? amazonList.error // Show the error message from the backend
                                          : "No data available"
                                      }
                                      placement="right"
                                      fontSize="xl"
                                      pt={2}
                                    >
                                      <Text color={colors[0]} fontSize="md" fontWeight="bold">
                                        Ext
                                      </Text>
                                    </Tooltip>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Extracted</Text>
                                  
                                </Flex>
                                </AccordionButton>
                                <AccordionPanel>
                                  <JsonTreeDisplay json={amazonList?.data[1]} />
                                </AccordionPanel>
                              </AccordionItem>
                          </Accordion>
                        </Stack>
                        </Card>  
                    </TabPanel>
                  <TabPanel>
                  <Card
                          width={'full'}
                          bg={'#ffffff1a'}
                          brightness={0.2}
                          mt={4}
                          borderRadius={'20px'}
                        >
                        <Stack>
                          <Accordion
                            width={'full'}
                            borderColor={'transparent'}
                            allowMultiple
                            defaultIndex={[0]}
                          >
                            <AccordionItem>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <AccordionIcon />
                                </Box>
                                <Flex justifyContent={'end'} align="center" gap={2}>
                                    <Text color={colors[0]} fontSize={'md'} fontWeight={'bold'}>Amz</Text>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Amazon,</Text>
                                    <Text color={colors[0]} fontSize={'md'} fontWeight={'bold'}>Ip</Text>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Input,</Text>
                                    <Tooltip
                                      hasArrow
                                      aria-label="A updated time tooltip"
                                      label={
                                        amazonList?.data && Array.isArray(amazonList.data) && amazonList.data[3]?.modified_date
                                          ? `Summary Last Generated at: ${new Date(
                                              new Date(`${amazonList.data[3].modified_date}`).toLocaleString(
                                                "en-US",
                                                {
                                                  timeZone: "Asia/Kolkata",
                                                }
                                              )
                                            ).toString()}`
                                          : amazonList?.error
                                          ? amazonList.error // Show the error message from the backend
                                          : "No data available"
                                      }
                                      placement="right"
                                      fontSize="xl"
                                      pt={2}
                                    >
                                      <Text color={colors[0]} fontSize="md" fontWeight="bold">
                                        Ext
                                      </Text>
                                    </Tooltip>
                                    <Text fontSize={'md'} fontWeight={'bold'}>= Extracted</Text>
                                  
                                </Flex>
                                </AccordionButton>
                                <AccordionPanel
                                >
                                  <JsonTreeDisplay json={amazonList?.data[2]} />
                                </AccordionPanel>
                              </AccordionItem>
                          </Accordion>
                        </Stack>
                      </Card>  
                  </TabPanel>
                </TabPanels>
              </Tabs>
     
      </>
    );
}