export class PaginatedCollection<TItem> {
  startIdx: number;
  pageSize: number;
  totalItems: number;
  items: TItem[];
}
