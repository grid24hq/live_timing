import { useEffect, useState } from 'react';

// We voegen een optionele size prop toe zodat de klok overal hergebruikt kan worden
interface ClockProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Clock({ size = 'md' }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const secondsDegrees = seconds * 6;
  const minutesDegrees = minutes * 6 + seconds * 0.1;
  const hoursDegrees = (hours % 12) * 30 + minutes * 0.5;

  // Dynamische Tailwind klassen op basis van de gekozen grootte
  const sizeClasses = {
    sm: 'w-16 h-16', // Perfect voor in de dashboard header balk!
    md: 'w-48 h-48', // Iets compacter en scherper dan de oude w-64
    lg: 'w-64 h-64', // De originele grootte
  };

  return (
    <div className={`relative ${sizeClasses[size]} select-none mx-auto transition-all duration-300`}>
      {/* Laag 1: De Wijzerplaat */}
      <img 
        src="/clock/tagFace-Red-LQ.e3041f60.webp" 
        alt="Clock Face" 
        className="absolute inset-0 w-full h-full object-contain z-0"
      />

      {/* Laag 2: Urenwijzer */}
      <img 
        src="/clock/tagHour.13fe95af.webp" 
        alt="Hour Hand" 
        className="absolute inset-0 w-full h-full object-contain z-10 transition-transform duration-300 ease-out" 
        style={{ 
          transform: `rotate(${hoursDegrees}deg)`,
          transformOrigin: 'center center'
        }} 
      />

      {/* Laag 3: Minutenwijzer */}
      <img 
        src="/clock/tagMinute.03c6bd43.webp" 
        alt="Minute Hand" 
        className="absolute inset-0 w-full h-full object-contain z-20 transition-transform duration-300 ease-out"
        style={{ 
          transform: `rotate(${minutesDegrees}deg)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Laag 4: Secondenwijzer */}
      <img 
        src="/clock/tagSecond.2e30a59c.webp" 
        alt="Second Hand" 
        className="absolute inset-0 w-full h-full object-contain z-30"
        style={{ 
          transform: `rotate(${secondsDegrees}deg)`,
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
}
