/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  welcomeMessage?: string;
  messagePlaceholder?: string;
  backgroundColor?: string;
  // Mirror new schema fields here. Example:
  //   maxItemsPerPage?: number;
  //   enableNotifications?: boolean;
  //   featuredCategories?: string[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "SimpleChat",
  logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=SimpleChat",
  brandColor: {
    primary: "#3B82F6",
    secondary: "#1E40AF",
    accent: "#93C5FD",
  },
  welcomeMessage: "Welcome to SimpleChat. Start a conversation with AI.",
  messagePlaceholder: "Type your message here...",
  backgroundColor: "#FFFFFF",
  // ─────────────────────────────────────────────────────────────────────
  // Add new field defaults here. See RULES.md §5 for per-type shape.
  // Required branding fields → use the FILL_X_HERE placeholder pattern.
  // Optional/typed defaults → real value with a "// fill it here" comment:
  //
  //   maxItemsPerPage: 12,                     // fill it here
  //   enableNotifications: true,               // fill it here
  //   featuredCategories: [],                  // fill it here
  //   defaultLanguage: "en",                   // must match enum options
  //   launchDate: "2025-01-01T00:00:00.000Z",  // ISO-8601
  //   heroImage: "",                           // resolved URL after upload
  //   galleryImages: [],                       // array of resolved URLs
  // ─────────────────────────────────────────────────────────────────────
};
