import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function BusinessesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="min-h-[calc(100vh-4rem)]">{children}</div>

      <PublicFooter />
    </div>
  );
}
