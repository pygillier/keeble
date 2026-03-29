/** PocketBase base record fields present on every collection */
interface BaseRecord {
  id: string;
  created: string;
  updated: string;
}

export interface Tag extends BaseRecord {
  name: string;
  color: string;
}

export interface Document extends BaseRecord {
  title: string;
  slug: string;
  body: string;
  /** Array of Tag IDs (or expanded Tags when fetched with expand=tags) */
  tags: string[];
  /** Array of image filenames stored in PocketBase */
  images: string[];
  /** Author user ID (or expanded User when fetched with expand=author) */
  author: string;
  expand?: {
    tags?: Tag[];
    author?: User;
  };
}

export interface Settings extends BaseRecord {
  app_name: string;
  default_locale: string;
  allow_registration: boolean;
  setup_completed: boolean;
}

export interface User extends BaseRecord {
  email: string;
  name: string;
  avatar: string;
  is_admin: boolean;
  locale: string;
}
