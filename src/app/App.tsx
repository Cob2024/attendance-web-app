import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import { initializeMockData } from './services/mockData';
import { Toaster } from 'sonner';

export default function App() {
    useEffect(() => {
        initializeMockData();
    }, []);

    return (
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors />
        </AuthProvider>
    );
}