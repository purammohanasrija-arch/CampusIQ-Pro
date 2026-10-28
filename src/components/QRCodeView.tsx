/**
 * CampusIQ Pro — QR Code Renderer Component
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, QrCode as QrIcon } from 'lucide-react';

interface QRCodeViewProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  showDownload?: boolean;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 180,
  title,
  subtitle,
  showDownload = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#064e3b', // Deep emerald dark
        light: '#ffffff',
      },
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('QR Generation failed:', err));
  }, [value, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `campusiq-qr-${value.slice(0, 15)}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-stone-200 shadow-sm text-center">
      {title && <h4 className="text-sm font-semibold text-stone-900 mb-0.5">{title}</h4>}
      {subtitle && <p className="text-xs text-stone-500 mb-3">{subtitle}</p>}

      <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 mb-3 relative flex items-center justify-center">
        {dataUrl ? (
          <img src={dataUrl} alt="CampusIQ QR Code" className="rounded" style={{ width: size, height: size }} />
        ) : (
          <div className="flex items-center justify-center bg-stone-100 rounded text-stone-400" style={{ width: size, height: size }}>
            <QrIcon className="w-8 h-8 animate-pulse text-emerald-600" />
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-stone-100 rounded text-xs font-mono text-stone-600 border border-stone-200">
        <span className="truncate max-w-[170px]" title={value}>{value}</span>
        <button
          onClick={handleCopy}
          className="p-1 text-stone-500 hover:text-emerald-700 transition-colors shrink-0"
          title="Copy code token"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showDownload && (
        <button
          onClick={handleDownload}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save PNG Badge</span>
        </button>
      )}
    </div>
  );
};
