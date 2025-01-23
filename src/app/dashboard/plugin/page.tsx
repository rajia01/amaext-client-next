"use client";

import { Fragment } from "react";
import { 
    Box,
    Card,
    Flex,
    Skeleton, 
    Stack,
    useToast,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { TablesDetails } from 'types/playwright';
import { getAllTableCounts } from "utils/api/playwright";
import { useQuery } from '@tanstack/react-query';
import GeneralCard from 'components/card/GeneralCard';
import { RxUpdate } from "react-icons/rx";



export default function Plugins() {
    const toast = useToast();

    const {
        data: playrightList,
        error,
        isLoading,
        isFetching,
        isSuccess
    }: {
        data: { data: TablesDetails };
        error: AxiosError;
        isLoading: boolean;
        isFetching: boolean;
        isSuccess: boolean;
    } = useQuery({
        queryKey: ['dataPlugins'],
        queryFn: () => getAllTableCounts('plugins'),
        refetchOnWindowFocus: false,
    });


    const data = playrightList?.data;
    const title = "List of all Plugins tables along with their row count and column details"

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


    if (isLoading || isFetching) {
        return (
            <>
                <Stack width={"full"} spacing={4}>
                    <Flex justifyContent={'end'}>
                        <Skeleton borderRadius={"2xl"}>
                            <Flex align="center" gap={2}>
                                <Box width="15px" height="15px" borderRadius="full" />
                                <Box width="150px" height="15px" />
                                <Box width="15px" height="15px" borderRadius="full" />
                                <Box width="200px" height="15px" />
                                <Box width="15px" height="15px" borderRadius="full" />
                                <Box width="150px" height="15px" />
                                <Box width="15px" height="15px" borderRadius="full" />
                                <Box width="100px" height="15px" />
                            </Flex>
                        </Skeleton>
                    </Flex>
    
                    <Flex
                        justify={'space-between'}
                        align={'center'}
                        p={4}
                        border={'1px solid'}
                        borderColor={'white.400'}
                        borderRadius={'10px'}
                    >
                        <Skeleton borderRadius={"2xl"}>
                            <Box width={['10px', '70px', '300px', '600px']} height="30px"/>
                        </Skeleton>
                        <Flex direction={'row'} gap={2} align={"center"}>
                            {[...Array(4)].map((_, index) => (
                                <Fragment key={index}>
                                    <Skeleton borderRadius={"2xl"} key={index}>
                                        <Box width="40px" height="25px" />
                                    </Skeleton>
                                    {index<3 && <Box fontWeight={"extrabold"} fontSize={"25"}>+</Box>}
                                </Fragment>
                            ))}
                            <Box fontWeight={"extrabold"} fontSize={"25"}>=</Box>
                            <Skeleton borderRadius={"2xl"}>
                                <Box width="50px" height="25px" />
                            </Skeleton>
                        </Flex>
                    </Flex>
    
                    
                    {[...Array(4)].map((_, index) => (
                        <Skeleton borderRadius={'30px'} height={"28"} key={index}>
                                <Card
                                    key={index}
                                    width={'full'}
                                    bg={'#ffffff1a'}
                                    brightness={0.2}
                                    mt={index > 0 ? 4:0}
                                    height="200px"   
                                />
                        </Skeleton>
                    ))}
            </Stack>
            </>
        );
    }
    

    if(isSuccess){
        toast.closeAll();
        toast({
            title: "Success",
            description: "Data fetched successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    }
    

    return (
  
        <Stack maxW={'9xl'} mx={'auto'} alignItems={'center'}>
            <GeneralCard
                title={title}
                info={data}
                // description={description_all}
                icon={<RxUpdate/>}
                type="plugins"
            /> 
        </Stack>
    );
}
