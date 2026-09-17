import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AppRouter } from '@/app/router';

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
