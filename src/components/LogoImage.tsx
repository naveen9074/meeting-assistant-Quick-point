interface LogoImageProps {
  className?: string;
}

export function LogoImage({ className }: LogoImageProps) {
  return (
    <img
      src={window.matchMedia('(prefers-color-scheme: dark)').matches ? '/qtranperantlogo.png' : '/qlogo.png'}
      alt="QuickPoint"
      className={className}
    />
  );
}
