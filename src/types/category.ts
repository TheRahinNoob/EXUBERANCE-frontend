export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  is_campaign?: boolean;
  children: Category[];
};
