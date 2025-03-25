import { Button } from "@/components/ui/button";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from 'qrcode.react';

export function WhatsAppStatusPanel() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { startSession, isLoading, error, whatsAppState } = useWhatsApp(userId);
  const isConnected = whatsAppState.state === 'CONNECTED';
  const isConnecting = whatsAppState.state === 'QR_READY' || whatsAppState.state === 'INITIALIZING';
  const isDisconnected = whatsAppState.state === 'DISCONNECTED';
  const canConnect = !isLoading && !isConnecting && (!whatsAppState.state || isDisconnected);

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">WhatsApp Status</span>
        <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : isConnecting ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </span>
      </div>
      
      <div className="mt-1 text-xs">
        {isConnected && (
          <div className="flex items-center text-green-600 mb-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span>Ready to send messages</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-2">{/*error?.toString()*/}</div>
        )}

        {!isConnected && (
          <div className="flex flex-col items-center">
            {whatsAppState.qr && (
              <div className="my-4 p-4 bg-white rounded-lg shadow-sm">
                <QRCodeSVG
                  value={whatsAppState.qr || ''}
                  size={192}
                  className="w-48 h-48"
                  level="M"
                />
                <p className="text-center mt-2 text-sm text-gray-600">
                  Scan this QR code with WhatsApp on your phone
                </p>
              </div>
            )}

            <Button 
              className="w-full mt-2" 
              size="sm"
              onClick={async () => {
                try {
                  if (!userId) {
                    console.error('User ID not available');
                    return;
                  }
                  await startSession(userId);
                } catch (error) {
                  console.error('Failed to connect WhatsApp:', error);
                }
              }}
              disabled={!canConnect}
            >
              {isLoading ? 'Initializing...' : 
               whatsAppState.state === 'QR_READY' ? 'Waiting for QR scan...' :
               whatsAppState.state === 'INITIALIZING' ? 'Preparing QR code...' :
               isDisconnected ? 'Reconnect WhatsApp' :
               'Connect WhatsApp'}
            </Button>
          </div>
        )}
      
        {isConnected && (
          <div className="flex flex-col gap-2 mt-2">
            <Button 
              className="w-full" 
              size="sm"
              variant="outline"
              onClick={async () => {
                if (userId) await startSession(userId);
              }}
            > 
              Check Connection Status
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
