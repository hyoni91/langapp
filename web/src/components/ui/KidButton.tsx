export function KidButton({
  children, className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "h-12 min-w-28 px-5 rounded-kids bg-brand-500 text-white " +
        "shadow-soft active:scale-98 hover:scale-102 transition-transform duration-kids " +
        "focus:outline-none focus:ring-4 focus:ring-brand-200 " + className
      }
    >
      {children}
    </button>
  );
}
