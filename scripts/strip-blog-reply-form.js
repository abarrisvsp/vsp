// Strip WordPress "Leave a Reply" comment form from every blog_posts.body_html.
// Anchor: <h2>Leave a Reply ... </h2> through end of body. Pass --apply to write; default is dry-run.
// Usage:
//   cd ~/Desktop/vsp-site
//   node -r dotenv/config scripts/strip-blog-reply-form.js dotenv_config_path=.env.local            # dry run
//   node -r dotenv/config scripts/strip-blog-reply-form.js dotenv_config_path=.env.local --apply    # apply
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing Supabase env'); process.exit(1); }
const APPLY = process.argv.includes('--apply');

// Match <h2 ...>Leave a Reply ...</h2> and everything after, to end of string.
// Case-insensitive on the heading text; tolerates extra attrs and whitespace.
const ANCHOR_RE = /\s*<h2\b[^>]*>\s*Leave a Reply[\s\S]*$/i;

const sb = createClient(url, key);

(async () => {
  const { data, error } = await sb.from('blog_posts').select('id,title,slug,body_html');
  if (error) { console.error(error); process.exit(1); }
  console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — scanning ${data.length} posts.\n`);

  let changed = 0;
  for (const p of data) {
    const before = p.body_html || '';
    if (!ANCHOR_RE.test(before)) continue;
    const after = before.replace(ANCHOR_RE, '').replace(/\s+$/, '');
    if (after === before) continue;
    changed++;
    console.log(`• ${p.title} (${p.slug})`);
    console.log(`    ${before.length} → ${after.length} chars (-${before.length - after.length})`);
    if (APPLY) {
      const { error: upErr } = await sb.from('blog_posts').update({ body_html: after }).eq('id', p.id);
      if (upErr) console.error('    update failed:', upErr.message);
      else console.log('    updated.');
    }
  }
  console.log(`\n${APPLY ? 'Updated' : 'Would update'} ${changed} post(s).`);
})();
