export default function PortalLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {children}
    </div>
  );
}
