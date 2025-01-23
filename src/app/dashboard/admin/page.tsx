'use client';

import React, { useEffect } from 'react';
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
// Custom components
import { HSeparator } from 'components/separator/Separator';
import DefaultAuthLayout from 'layouts/auth/Default';
// Assets
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import Head from 'next/head';
import { Field, Form, Formik, FormikProps } from 'formik';
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { BACKEND_DOMAIN } from '../../../../urls';


type FormDetails = {
    table_name: string;
    script_name: string;	
    script_type: string;	
    who_requested: string;	
    version: string;	
    developed_by: string;	
    source_link: string;

};


export default function Admin() {
    const textColor = useColorModeValue('navy.700', 'white');
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const toast = useToast();
    const router = useRouter();
  
  
    const handleSubmit = async (
      values: { table_name: string,script_name: string,script_type: string,who_requested: string,version: string,developed_by: string,source_link: string },
      { setSubmitting }: { setSubmitting: any },
    ) => {
      try {
        setSubmitting(true);
        let formData = new FormData();
        formData.append('table_name', values.table_name);
        formData.append('script_name', values.script_name);
        formData.append('script_type', values.script_type);
        formData.append('who_requested', values.who_requested);
        formData.append('version', values.version);
        formData.append('developed_by', values.developed_by);
        formData.append('source_link', values.source_link);
  

        console.log(formData);
  
        const response = await fetch(`${BACKEND_DOMAIN}/submit/`, {
          body: formData,
          method: 'POST',
          mode: 'cors',
          headers: {
            Accept: 'application/json',
          },
        });
        const data = await response.json();
  
        if (response.status !== 200) {
          throw new Error(data.error.msg);
        }
  
  
        toast.closeAll();
        toast({
          title: 'Form Submission Successful!',
          description: 'Refreshing Page...',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        window.location.reload();
      } catch (error: any) {
        toast.closeAll();
        toast({
          title: 'Error',
          description: `${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.error(error);
      }
  
      setSubmitting(false);
    };
  
    
    return (
<Flex
  maxW={{ base: '100%', md: 'max-content' }}
  w="100%"
  h="100vh" 
  mx="auto" 
    px={{ base: '25px', md: '0px' }}
  alignItems="center"
  justifyContent="center"
  flexDirection="column"
  mt={{ base: '10px', md: '-8vh' }}
>
  <Box me="auto">
    <Heading color={textColor} fontSize="25px" mb="30px">
      Enter Plugin Details
    </Heading>
  </Box>
  <Flex
    zIndex="2"
    direction="column"
    w={{ base: '100%', md: '420px' }}
    maxW="100%"
    background="transparent"
    borderRadius="15px"
    mx="auto"
  >
          <Formik
            initialValues={{ table_name: '', script_name: '', script_type: '', who_requested:'', version:'', developed_by:'', source_link:'' }}
            validate={(values) => {
              const errors: any = {};
            //   if (!values.script_type) {
            //     errors.script_type = 'Required';
            //   } else if (
            //     !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            //   ) {
            //     errors.email = 'Invalid email address';
            //   }
            //   return errors;
            }}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<FormDetails>) => (
              <Form onSubmit={props.handleSubmit}>
                <Field name="Table Name">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.name && form.touched.name}
                    >
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Table Name<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        {...field}
                        isRequired={true}
                        variant="auth"
                        fontSize="sm"
                        ms={{ base: '0px', md: '0px' }}
                        type="text"
                        name="table_name"
                        mb="24px"
                        fontWeight="500"
                        size="lg"
                        placeholder="Enter Table Name"
                      />
                      <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="Script Name">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.script_name && form.touched.script_name}
                    >
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Script Name<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Enter Script Name"
                          mb="24px"
                          size="lg"
                          name="script_name"
                          type='text'
                          variant="auth"
                        />
                      </InputGroup>
                      <FormErrorMessage marginBottom={4}>
                        {form.errors.script_name}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="script_type">
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl isInvalid={form.errors.script_type && form.touched.script_type}>
                    <FormLabel
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      display="flex"
                    >
                      Script Type<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Select
                      {...field}
                      placeholder="Select script type"
                      mb="20px"
                      isRequired={true}
                    >
                      <option value="playwright">Playwright</option>
                      <option value="plugins">Plugins</option>
                      <option value="plugins-linkedin">Plugins-Linkedin</option>
                    </Select>
                    <FormErrorMessage marginBottom={4}>
                      {form.errors.script_type}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>

                <Field name="Requested By">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.who_requested && form.touched.who_requested}
                    >
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Requested By<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Enter Requested By"
                          mb="24px"
                          size="lg"
                          name="who_requested"
                          type='text'
                          variant="auth"
                        />
                      </InputGroup>
                      <FormErrorMessage marginBottom={4}>
                        {form.errors.who_requested}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="Version">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.version && form.touched.version}
                    >
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Version<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Enter Version"
                          mb="24px"
                          size="lg"
                          name="version"
                          type='text'
                          variant="auth"
                        />
                      </InputGroup>
                      <FormErrorMessage marginBottom={4}>
                        {form.errors.version}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="Developed By">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.developed_by && form.touched.developed_by}
                    >
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Developed By<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Enter Developed By"
                          mb="24px"
                          size="lg"
                          name="developed_by"
                          type='text'
                          variant="auth"
                        />
                       
                      </InputGroup>
                      <FormErrorMessage marginBottom={4}>
                        {form.errors.developed_by}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="Source Link">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl
                      isInvalid={form.errors.source_link && form.touched.source_link}
                    >
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Source Link<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          {...field}
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Enter Source Link"
                          mb="24px"
                          size="lg"
                          name="source_link"
                          type='text'
                          variant="auth"
                        />
                      </InputGroup>
                      <FormErrorMessage marginBottom={4}>
                        {form.errors.password}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Button
                  fontSize="sm"
                  variant="brand"
                  fontWeight="500"
                  w="100%"
                  h="50"
                  mb="24px"
                  isLoading={props.isSubmitting}
                  type="submit"
                >
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </Flex>
      </Flex>
    );
  }