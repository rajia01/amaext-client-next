'use client';
import React, { ReactNode } from 'react';
import 'styles/App.css';
import 'styles/Contact.css';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Task, TaskContext } from 'contexts/TaskId';


export const queryClient = new QueryClient();
export default function AppWrappers({ children }: { children: ReactNode }) {
  const [taskid, setTaskid] = React.useState<Task>({task_id: 0});
  return (
          <QueryClientProvider client={queryClient}>
            <TaskContext.Provider value= { {taskid, setTaskid} }>
              <ChakraProvider theme={theme}>
                {children}
              </ChakraProvider>
            </TaskContext.Provider>
          </QueryClientProvider>
      // {' '}
  );
}
