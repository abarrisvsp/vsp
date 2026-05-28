import { FeaturedWorkEditor } from '@/components/admin/FeaturedWorkEditor';

export default function NewFeaturedWorkPage() {
  return (
    <div className="px-8 py-10 max-w-5xl">
      <h1 className="font-serif italic text-4xl mb-8">New Case Study</h1>
      <FeaturedWorkEditor />
    </div>
  );
}
