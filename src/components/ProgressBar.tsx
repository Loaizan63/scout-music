interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
}

export const ProgressBar = ({ current, max, label }: ProgressBarProps) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  // Determinar clase de ancho basado en porcentaje
  let widthClass = 'w-0';
  if (percentage > 0 && percentage <= 10) widthClass = 'w-[10%]';
  else if (percentage > 10 && percentage <= 20) widthClass = 'w-[20%]';
  else if (percentage > 20 && percentage <= 30) widthClass = 'w-[30%]';
  else if (percentage > 30 && percentage <= 40) widthClass = 'w-[40%]';
  else if (percentage > 40 && percentage <= 50) widthClass = 'w-[50%]';
  else if (percentage > 50 && percentage <= 60) widthClass = 'w-[60%]';
  else if (percentage > 60 && percentage <= 70) widthClass = 'w-[70%]';
  else if (percentage > 70 && percentage <= 80) widthClass = 'w-[80%]';
  else if (percentage > 80 && percentage <= 90) widthClass = 'w-[90%]';
  else if (percentage > 90) widthClass = 'w-full';

  const colorClass = 
    current > max * 0.9 ? 'bg-amber-600' : 
    current > max * 0.7 ? 'bg-blue-600' : 
    current > 0 ? 'bg-green-600' : 'bg-gray-300';

  return (
    <div className="space-y-2">
      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden" title={label}>
        <div 
          className={`h-full transition-all duration-300 ${colorClass} ${widthClass}`}
        />
      </div>
    </div>
  );
};
