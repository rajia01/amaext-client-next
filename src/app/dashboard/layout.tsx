'use client';
// Chakra imports
import {
  Portal,
  Box,
  useDisclosure,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import Footer from 'components/footer/FooterAdmin';
// Layout components
import Navbar from 'components/navbar/NavbarAdmin';
import Sidebar from 'components/sidebar/Sidebar';
import { SidebarContext } from 'contexts/SidebarContext';
import { PropsWithChildren, useEffect, useState } from 'react';
import { PiPlugChargingFill } from 'react-icons/pi';
// import routes from 'routes';
import { IRoute } from 'types/navigation';
import {
  getActiveNavbar,
  getActiveNavbarText,
  getActiveRoute,
  isWindowAvailable,
} from 'utils/navigation';
import { useMemo } from 'react';
import { SiPlaywright } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { TbReportSearch } from 'react-icons/tb';
import { IoEarth } from 'react-icons/io5';
import { AiFillAmazonSquare } from 'react-icons/ai';
import { BsClipboard2DataFill } from 'react-icons/bs';

interface DashboardLayoutProps extends PropsWithChildren {
  [x: string]: any;
}

const dashboardRoutes: IRoute[] = [
  {
    icon: (
      <Icon
        as={AiFillAmazonSquare}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    name: 'Amazon Dashboard',
    layout: '/dashboard',
    path: '/amazon',
    isPage: true,
    children: [
      {
        name: 'Insights',
        layout: '/dashboard/amazon',
        path: '/insights',
        icon: (
          <Icon
            as={BsClipboard2DataFill}
            width="20px"
            height="20px"
            color="inherit"
          />
        ),
        isPage: true,
      },
    ],
  },
  {
    icon: <Icon as={SiPlaywright} width="20px" height="20px" color="inherit" />,
    name: 'Playwright Dashboard',
    layout: '/dashboard',
    path: '/playwright',
    isPage: true,
  },
  {
    icon: (
      <Icon
        as={PiPlugChargingFill}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    name: 'Plugins Dashboard',
    layout: '/dashboard',
    path: '/plugin',
    isPage: true,
  },
  {
    icon: <Icon as={IoEarth} width="20px" height="20px" color="inherit" />,
    name: 'Third Party Dashboard',
    layout: '/dashboard',
    path: '/thirdparty',
    isPage: true,
  },
  {
    icon: <Icon as={FaLinkedin} width="20px" height="20px" color="inherit" />,
    name: 'Linkedin Dashboard',
    layout: '/dashboard',
    path: '/linkedin',
    isPage: true,
  },
  {
    icon: (
      <Icon as={TbReportSearch} width="20px" height="20px" color="inherit" />
    ),
    name: 'Extraction Report',
    layout: '/dashboard',
    path: '/report',
    isPage: true,
  },
];

// Custom Chakra theme
export default function DashboardLayout(props: DashboardLayoutProps) {
  const { children, ...rest } = props;
  const [fixed] = useState(false);
  const [brandText, setBrandText] = useState<string>('');
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const pathname = usePathname();

  const { onOpen } = useDisclosure();

  useEffect(() => {
    window.document.documentElement.dir = 'ltr';
  });

  const routes = useMemo(() => {
    return dashboardRoutes;
  }, [dashboardRoutes]);

  useEffect(() => {
    setBrandText(getActiveRoute(routes));
  }, [pathname]);

  // useEffect(() => {
  //   if (isWindowAvailable()) {
  //     // set scroll to top
  //     window.scrollTo(0, 0);
  //   }
  // });

  const bg = useColorModeValue('secondaryGray.300', 'navy.900');

  return (
    <Box h="100vh" bg={bg}>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Sidebar routes={routes} display="none" {...rest} />
        <>
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box>
                <Navbar
                  onOpen={onOpen}
                  logoText={'Plugin Dashboard'}
                  brandText={brandText}
                  secondary={getActiveNavbar(routes)}
                  message={getActiveNavbarText(routes)}
                  fixed={fixed}
                  routes={routes}
                  {...rest}
                />
              </Box>
            </Portal>

            <Box
              mx="auto"
              p={{ base: '20px', md: '30px' }}
              pe="20px"
              minH="94vh"
              pt="50px"
            >
              <Box pt={{ base: '100px', md: '80px', xl: '80px' }}>
                {children}
              </Box>
            </Box>
            <Box>
              <Footer />
            </Box>
          </Box>
        </>
      </SidebarContext.Provider>
    </Box>
  );
}
