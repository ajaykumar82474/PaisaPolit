// src/components/common/CurrencyDisplay.tsx
import React from 'react';

interface CurrencyDisplayProps {
  amount: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showSign?: boolean;
  highlightShortfall?: boolean;
  className?: string;
  subtext?: string;
}

export const formatRupee = (value: number): string => {
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round((value + Number.EPSILON) * 100) / 100);
  
  // Format in Indian number format (e.g. 1,00,000 or 10,000)
  const formatted = absValue.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
};

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  size = 'md',
  showSign = false,
  highlightShortfall = true,
  className = '',
  subtext,
}) => {
  const isNegative = amount < 0;

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-xl font-bold tracking-tight',
    '2xl': 'text-2xl font-extrabold tracking-tight',
    '3xl': 'text-3xl font-extrabold tracking-tight',
    '4xl': 'text-4xl md:text-5xl font-extrabold tracking-tight',
  }[size];

  let colorClass = 'text-slate-100';
  if (highlightShortfall && isNegative) {
    colorClass = 'text-brand-coral font-bold';
  }

  const sign = showSign && amount > 0 ? '+' : '';

  return (
    <span className={`inline-flex items-baseline font-mono ${sizeClasses} ${colorClass} ${className}`}>
      <span>
        {sign}
        {formatRupee(amount)}
      </span>
      {subtext && <span className="ml-1 text-xs text-slate-400 font-sans font-normal">{subtext}</span>}
    </span>
  );
};
