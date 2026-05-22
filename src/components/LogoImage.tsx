interface LogoImageProps {
  className?: string;
}

export function LogoImage({ className }: LogoImageProps) {
  return (
    <img
      src="/qlogo.png"
      alt="QuickPoint"
      className={className}
    />
  );
}
