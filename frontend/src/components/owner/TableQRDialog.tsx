import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TableDTO } from '@/dto/table.dto';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface TableQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: TableDTO | any; // Support both TableDTO and legacy Table from store
  branchId?: string; // Add branchId prop
}

export const TableQRDialog = ({ open, onOpenChange, table, branchId }: TableQRDialogProps) => {
  // Calculate values at top level (before any hooks)
  const finalBranchId = branchId || (table as any)?.branchId || '';
  const tableId = table?.id || (table as any)?.tableId || table?.areaTableId || '';
  
  // Check if all required data is present
  const hasValidBranchId = finalBranchId && finalBranchId.trim() !== '' && finalBranchId !== 'undefined';
  const hasValidTableId = tableId && tableId.trim() !== '';
  
  // Log for debugging
  useEffect(() => {
    if (open) {
      console.log('[TableQRDialog] Dialog opened with:', {
        branchId,
        finalBranchId,
        hasValidBranchId,
        tableId,
        hasValidTableId,
        table: table?.id || table?.tag,
      });
    }
  }, [open, branchId, finalBranchId, hasValidBranchId, tableId, hasValidTableId, table]);

  // Early return - don't render if dialog is closed or missing required data
  // Parent component already validates, so we trust the props
  if (!open || !table || !hasValidBranchId || !hasValidTableId) {
    return null;
  }

  // Use new URL format with branchId and tableId: /t/{branchId}/{tableId}
  // This format is unique and prevents conflicts when multiple branches have same area/table names
  const tableUrl = `${window.location.origin}/t/${finalBranchId}/${tableId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tableUrl);
    toast({
      title: 'Copied!',
      description: 'Table URL copied to clipboard',
    });
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${tableId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `table-${table.tag || (table as any).number || tableId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
          <DialogHeader>
            <DialogTitle>Table QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to access Table {table.tag || (table as any).number || 'Unknown'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-6">
            <div className="bg-white p-6 rounded-lg border-2 border-border">
              <QRCodeSVG id={`qr-${tableId}`} value={tableUrl} size={200} />
            </div>

            <div className="w-full space-y-3">
              <div className="p-3 bg-muted rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Table URL</p>
                <p className="text-sm font-mono break-all select-all">{tableUrl}</p>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">Share this URL</p>
                <p className="text-xs text-muted-foreground">
                  Guests can scan the QR code or visit this URL to view the menu and place orders for Table {table.tag || (table as any).number || 'Unknown'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </Button>
                <Button variant="outline" className="flex-1" onClick={downloadQR}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
};