interface LogoImageProps {
  className?: string;
}

export function LogoImage({ className }: LogoImageProps) {
  return (
    <img
      src="/logo-readme.png"
      alt="QuickPoint"
      className={className}
    />
  );
}
