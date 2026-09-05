import React from 'react';
import { X, Copy, Check, MessageSquare, Twitter, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url
}) => {
  const { addToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const fullUrl = window.location.origin + url;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    addToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Check out this listing on Selling Ajah: ${title} - ${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`Check out this property on Selling Ajah: ${title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(fullUrl)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-black/8 dark:border-white/10 mb-4">
          <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#D4AF37]" />
            Share Listing
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
          {title}
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter / X</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-neutral-50 dark:bg-black/60 p-2 rounded-xl border border-black/10 dark:border-white/10">
          <input
            type="text"
            readOnly
            value={fullUrl}
            className="bg-transparent text-xs text-neutral-800 dark:text-neutral-300 w-full outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2f] text-black font-semibold transition-colors shrink-0"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
