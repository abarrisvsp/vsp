// Editable wording for outgoing emails. Kept free of server imports so the
// admin UI can show the defaults as placeholders.

export type EmailWording = {
  /** Small label above a blog post email, e.g. "New from VSP · Journal". */
  eyebrow: string;
  /** The "why you're getting this" line near the bottom of every email. */
  intro: string;
  /** Button text in blog post emails. */
  button: string;
  /** Business name and address line in the footer of every email. */
  footer: string;
};

export const DEFAULT_EMAIL_WORDING: EmailWording = {
  eyebrow: 'New from VSP · Journal',
  intro: "You're getting this because you've subscribed to updates from Visionary Sound Productions.",
  button: 'Read the full post →',
  footer: 'Visionary Sound Productions · Commerce Township, MI',
};

export const EMAIL_WORDING_KEYS: Record<keyof EmailWording, string> = {
  eyebrow: 'email_template_eyebrow',
  intro: 'email_template_intro',
  button: 'email_template_button',
  footer: 'email_template_footer',
};

export const EMAIL_WORDING_FIELDS = Object.keys(EMAIL_WORDING_KEYS) as (keyof EmailWording)[];
