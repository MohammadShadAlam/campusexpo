import Image from "next/image";

export function Logo({ size = 38, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Image 
        src="/logo.png" 
        alt="Campus Expo Logo" 
        width={size} 
        height={size} 
        className="rounded-lg object-contain"
        priority
      />
    </div>
  );
}