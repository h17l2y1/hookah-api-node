import { GetAllRequestDto } from '../dto/get-all-request.dto';
import { parsePositiveInt } from './ids';

export function getPaging(request: GetAllRequestDto) {
  return {
    skip: request.page * request.take,
    take: request.take,
  };
}

export function sortDirection(sortBy: string): 'asc' | 'desc' {
  return String(sortBy).toLowerCase() === 'desc' ? 'desc' : 'asc';
}

export function nullableInt(value: string | number | null | undefined): number | null {
  return parsePositiveInt(value);
}
