import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import { initializeMockData } from './services/mockData';
import { registerServiceWorker } from './services/registerSW';
import { OfflineBanner } from './components/OfflineBanner';
import { Toaster } from 'sonner';

export default function App() {
    useEffect(() => {
        initializeMockData();
        registerServiceWorker();
    }, []);

    return (
        <AuthProvider>
            <OfflineBanner />
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors />
        </AuthProvider>
    );
}