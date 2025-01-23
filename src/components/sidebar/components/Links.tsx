'use client';

// chakra imports
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { IRoute } from 'types/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

interface SidebarLinksProps {
  routes: IRoute[];
}

export function SidebarLinks(props: SidebarLinksProps) {
  const { routes } = props;

  //   Chakra color mode
  const pathname = usePathname();

  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.600',
  );
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('brand.500', 'brand.400');

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname],
  );

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, index: number) => {
      if (
        route.layout === '/admin' ||
        route.layout === '/auth' ||
        route.layout === '/rtl' ||
        route.layout === '/dashboard'
      ) {
        return (
          <Link key={index} href={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                  }
                  py="5px"
                  ps="10px"
                >
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeIcon
                          : textColor
                      }
                      me="18px"
                      display={'flex'}
                      alignItems={'center'}
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase())
                          ? 'bold'
                          : 'normal'
                      }
                    >
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h="36px"
                    w="4px"
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor
                        : 'transparent'
                    }
                    borderRadius="5px"
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? '22px' : '26px'
                  }
                  py="5px"
                  ps="10px"
                >
                  <Text
                    me="auto"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? 'bold' : 'normal'
                    }
                  >
                    {route.name}
                  </Text>
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </Link>
        );
      }
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

// export default SidebarLinks;

const NavigationItem = ({ routes }: { routes: IRoute[] }) => {
  const pathname = usePathname();

  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.600',
  );
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('brand.500', 'brand.400');

  const expandedIndex = routes.findIndex((route) => {
    return pathname.includes(route.layout + route.path);
  });

  const activeRoute = (routeName: string) => {
    return pathname === routeName;
  };

  const defaultIndex = expandedIndex !== -1 ? [expandedIndex] : [];

  return (
    <Accordion
      key={routes.join(',').toString()}
      allowMultiple
      defaultIndex={defaultIndex}
    >
      {routes.map((route: IRoute) => (
        <AccordionItem key={route.path} border={'none'}>
          <Link href={route.isPage ? `${route.layout}${route.path}` : ''}>
            <AccordionButton
              bg={'transparent'}
              _hover={{
                bg: 'transparent',
              }}
            >
              {/* {route.icon}
              <Box ml={2} as="span" flex="1" textAlign="left">
                <Text
                  color={
                    activeRoute(route.layout + route.path)
                      ? activeColor
                      : textColor
                  }
                  fontWeight={
                    activeRoute(route.layout + route.path) ? 'bold' : 'normal'
                  }
                >
                  {route.name}
                </Text>
              </Box> */}
              <Box as="span" flex="1" textAlign="left">
                <HStack>
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        activeRoute(route.layout + route.path)
                          ? activeIcon
                          : textColor
                      }
                      display={'flex'}
                      alignItems={'center'}
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        activeRoute(route.layout + route.path)
                          ? activeColor
                          : textColor
                      }
                      ml={2}
                      fontWeight={
                        activeRoute(route.layout + route.path)
                          ? 'bold'
                          : 'normal'
                      }
                    >
                      {route.name}
                    </Text>
                  </Flex>
                  {route.children && (
                    <Box
                      color={
                        activeRoute(route.layout + route.path)
                          ? activeIcon
                          : textColor
                      }
                      display={'flex'}
                      alignItems={'center'}
                    >
                      <AccordionIcon />
                    </Box>
                  )}
                </HStack>
              </Box>
            </AccordionButton>
          </Link>
          {route.children && (
            <AccordionPanel pb={2} pt={0} border={'none'}>
              <NavigationItem routes={route.children} />
            </AccordionPanel>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const NavigationMenu = ({ routes }: { routes: IRoute[] }) => {
  return (
    <div>
      <NavigationItem key={'my-navigation'} routes={routes} />
    </div>
  );
};

export default NavigationMenu;
