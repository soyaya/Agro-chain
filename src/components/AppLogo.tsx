import Image from "next/image";

export default function AppLogo() {
  return (
    <Image
      src="/images/agro-chain-logo.png"
      alt="Agro-chain Logo"
      width={120}
      height={40}
      priority
      className="h-auto w-auto"
    />
  );
}
