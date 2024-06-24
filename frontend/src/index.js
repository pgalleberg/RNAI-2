import ReactDOM from 'react-dom/client';
import './index.css';

import { AuthContext } from './AuthContext';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import createTheme from './theme';

// Create a client
const queryClient = new QueryClient()


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <AuthContext>
        <App /> 
      </AuthContext>
    </ThemeProvider>
  </QueryClientProvider>
  // </React.StrictMode>
);