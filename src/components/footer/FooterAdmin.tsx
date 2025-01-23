/*eslint-disable*/

import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

export default function Footer() {
  const textColor = useColorModeValue('gray.400', 'white');
  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: 'column',
        xl: 'row',
      }}
      alignItems={{
        base: 'center',
        xl: 'start',
      }}
      justifyContent="space-between"
      px={{ base: '30px', md: '50px' }}
      pb="30px"
    >
      <Text
        color={textColor}
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        mb={{ base: '20px', xl: '0px' }}
      >
        {' '}
        &copy; {new Date().getFullYear()}
        <Text as="span" fontWeight="500" ms="4px">
          InfoAnalytica. All Rights Reserved.
          {/* <Link
            mx="3px"
            color={textColor}
            href="https://www.infoanalytica.com/"
            target="_blank"
            fontWeight="700"
          >
            InfoAnalytica!
          </Link> */}
        </Text>
      </Text>
      <List display="flex">
        <ListItem
          me={{
            base: '20px',
            md: '44px',
          }}
        >
          <Link
            fontWeight="500"
            color={textColor}
            href="http://cdpstaging.plugtools.in/"
          >
            CDP Staging
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: '20px',
            md: '44px',
          }}
        >
          <Link
            fontWeight="500"
            color={textColor}
            href="http://api.cdpstaging.plugtools.in:3000/home"
          >
            AWS Monitoring
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            color={textColor}
            href="https://43.204.201.109/loginEmployee/?next=/"
          >
            S1
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
