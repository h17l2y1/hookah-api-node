export class GetAllResponseDto<T> {
  constructor(total = 0, list: T[] = []) {
    this.total = total;
    this.list = list;
  }

  total: number;
  list: T[];
}
