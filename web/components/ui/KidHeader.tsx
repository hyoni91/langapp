export function KidHeader({ title, emoji="🦊" }: { title: string; emoji?: string; }) {
  return (
    <header className="shrink-0 bg-lemon-100 border-b px-6 py-4">
      <h1 className="text-kid-2xl font-extrabold flex items-center gap-2">
        <span aria-hidden>{emoji}</span>{title}
      </h1>
    </header>
  );
}
