export function ProcessStep({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-6 md:gap-10 py-10 border-b border-line last:border-b-0">
      <span className="font-serif italic text-5xl md:text-6xl text-brand leading-none">{num}</span>
      <div>
        <h3 className="font-serif italic text-2xl md:text-3xl mb-3 leading-tight">{title}</h3>
        <p className="text-ink-dim leading-relaxed max-w-2xl">{body}</p>
      </div>
    </li>
  );
}
