// Shared between the admin editor (LegalContent.jsx) and the public viewer
// (PublicLegalContent.jsx) — type must match backend LEGAL_CONTENT_TYPES,
// slug must match backend LEGAL_CONTENT_SLUGS.
export const LEGAL_DOCS = [
  { type: 'PRIVACY_POLICY', label: 'Privacy Policy', slug: 'privacy-policy' },
  { type: 'TERMS_CONDITIONS', label: 'Terms & Conditions', slug: 'terms-conditions' },
  { type: 'RETURN_REFUND_POLICY', label: 'Return & Refund Policy', slug: 'return-refund-policy' },
  { type: 'ABOUT_US', label: 'About Us', slug: 'about-us' },
];

export const getLegalDocBySlug = (slug) => LEGAL_DOCS.find((d) => d.slug === slug);
