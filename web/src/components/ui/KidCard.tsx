export function KidCard({ icon, title, desc }: { icon: string; title: string; desc?: string; }) {
  return (
    <div className="rounded-blob bg-white shadow-soft border border-orange-100 p-5 hover:shadow-card transition-shadow duration-kids">
      <div className="text-3xl" aria-hidden>{icon}</div>
      <div className="mt-2 text-kid-xl font-bold">{title}</div>
      {desc && <p className="mt-1 text-gray-600">{desc}</p>}
    </div>
  );
}
