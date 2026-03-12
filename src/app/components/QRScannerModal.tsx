import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: { code: string; courseId: string }) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setError('');
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // QR code not detected — silent
        }
      );
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err?.toString().includes('NotAllowedError') || err?.toString().includes('Permission')) {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else if (err?.toString().includes('NotFoundError')) {
        setError('No camera found on this device. Please try on a device with a camera.');
      } else {
        setError('Unable to access camera. Please check permissions and try again.');
      }
      setScanning(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.code && data.courseId) {
        stopScanner();
        onScan({ code: data.code, courseId: data.courseId });
      } else {
        setError('Invalid QR code. Please scan the attendance QR code from your lecturer.');
      }
    } catch {
      setError('Invalid QR code format. Please scan the attendance QR code from your lecturer.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        // Ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-ttu-navy" />
            <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative bg-black rounded-xl overflow-hidden"
            style={{ minHeight: '300px' }}
          >
            <div id="qr-reader" className="w-full"></div>

            {/* Scanning Overlay */}
            {scanning && !error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-60 h-60 border-2 border-white/30 rounded-2xl relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                  {/* Scan line animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-emerald-400/70 animate-pulse top-1/2"></div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {!error && (
            <p className="text-sm text-gray-500 text-center mt-3">
              Point your camera at the QR code displayed by your lecturer
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    startScanner();
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-700 mt-1 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
