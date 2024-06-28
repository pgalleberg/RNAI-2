import ReactDOM from 'react-dom/client';
import './index.css';

import { AuthContext } from './AuthContext';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import createTheme from './theme';
import { Context } from './context/globalContext';

// Create a client
const queryClient = new QueryClient()


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <Context>
        <AuthContext>
          <App /> 
        </AuthContext>
      </Context>
    </ThemeProvider>
  </QueryClientProvider>
  // </React.StrictMode>
);