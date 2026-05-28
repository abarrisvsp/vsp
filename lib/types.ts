export type SiteContent = {
  key: string;
  value: string | null;
  updated_at: string;
};

export type Service = {
  id: string;
  letter: string | null;
  title: string;
  description: string | null;
  url: string | null;
  sort_order: number;
  active: boolean;
  updated_at: string;
};

export type GalleryPhoto = {
  id: string;
  storage_path: string;
  public_url: string;
  category: string;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  attribution_name: string | null;
  attribution_context: string | null;
  sort_order: number;
  active: boolean;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  category_tag: string | null;
  cover_image_url: string | null;
  cover_storage_path: string | null;
  body_html: string | null;
  excerpt: string | null;
  read_time_minutes: number | null;
  published: boolean;
  published_at: string | null;
  email_subscribers: boolean;
  subscribers_emailed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscriber = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  active: boolean;
  source: string | null;
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export type ContactSubmission = {
  id: string;
  event_type: string | null;
  services_needed: string[] | null;
  event_date: string | null;
  date_flexible: boolean;
  headcount: string | null;
  venue_city: string | null;
  budget_range: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_contact: string | null;
  message: string | null;
  read: boolean;
  archived: boolean;
  notes: string | null;
  submitted_at: string;
};

export type PressLogo = {
  id: string;
  name: string;
  logo_url: string | null;
  storage_path: string | null;
  link_url: string | null;
  sort_order: number;
  active: boolean;
};

export type SeoSettings = {
  route: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  og_storage_path: string | null;
  updated_at: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  visible: boolean;
  is_custom: boolean;
};

export type Faq = {
  id: string;
  page: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
  updated_at: string;
};

export type FeaturedWork = {
  id: string;
  slug: string;
  headline: string;
  event_type: string | null;
  client_name: string | null;
  venue: string | null;
  event_date: string | null;
  guest_count: number | null;
  cover_image_url: string | null;
  cover_storage_path: string | null;
  body_html: string | null;
  gallery_photo_ids: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaFile = {
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  width: number | null;
  height: number | null;
  category: string;
  createdAt: string;
};
