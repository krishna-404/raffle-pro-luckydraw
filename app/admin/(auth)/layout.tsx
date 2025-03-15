export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
} 