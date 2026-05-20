export interface UrlRow {
  id: number;
  short_code: string;
  original_url: string;
  created_at: string;
  visit_count: number;
  last_visited_at: string | null;
}
