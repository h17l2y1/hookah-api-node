export class GetAllResponseDto<T> {
  constructor(total = 0, list: T[] = []) {
    this.Total = total;
    this.List = list;
  }

  Total: number;
  List: T[];
}
