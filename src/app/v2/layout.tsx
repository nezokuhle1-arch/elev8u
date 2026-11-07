import { Google_Sans_Flex } from "next/font/google";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-v2",
  display: "swap",
});

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className={googleSansFlex.variable}>{children}</div>;
}
