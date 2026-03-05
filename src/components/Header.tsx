import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export default function Header({ title, showBack = true, rightElement, className, onBack }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn("flex items-center bg-white p-4 border-b border-slate-200 sticky top-0 z-10", className)}>
      <div className="flex items-center gap-3 flex-1">
        {showBack && (
          <button 
            onClick={handleBack}
            className="text-primary flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
      {rightElement && (
        <div className="flex items-center gap-4">
          {rightElement}
        </div>
      )}
    </header>
  );
}
