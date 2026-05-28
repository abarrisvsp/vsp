// scripts/scan-blog-html.js — dry-run scan for WordPress comment-form remnants
// Run with: cd ~/Desktop/vsp-site && node -r dotenv/config scripts/scan-blog-html.js dotenv_config_path=.env.local
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing Supabase env'); process.exit(1); }

const sb = createClient(url, key);

const NEEDLES = [
  'Leave a Reply', 'Leave a reply', 'Cancel reply', 'cancel-comment-reply',
  'comment-form', 'commentform', 'email address will not be published',
  'Save my name, email, and website',
];

(async () => {
  const { data, error } = await sb.from('blog_posts').select('id,title,slug,body_html');
  if (error) { console.error(error); process.exit(1); }
  console.log(`Scanned ${data.length} posts.`);
  for (const p of data) {
    const hits = NEEDLES.filter((n) => (p.body_html || '').includes(n));
    if (hits.length) {
      console.log(`\n--- ${p.title} (${p.slug}) [id=${p.id}] ---`);
      console.log('Matches:', hits.join(', '));
      const idx = Math.min(...hits.map((h) => p.body_html.indexOf(h)).filter((i) => i >= 0));
      console.log('Context around first match:');
      console.log(p.body_html.slice(Math.max(0, idx - 80), idx + 400).replace(/\s+/g, ' '));
    }
  }
})();
