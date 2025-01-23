import { Box } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
import RootHead from './head';

export const metadata = {
  title: 'Plugins Dashboard',
  description: '',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <RootHead title={metadata.title}/>
        <body id={'root'}>
          <AppWrappers>{children}</AppWrappers>
        </body>
    </html>
  );
}
