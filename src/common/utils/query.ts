import { GetAllRequestDto } from '../dto/get-all-request.dto';
import { parsePositiveInt } from './ids';

export function getPaging(request: GetAllRequestDto) {
  return {
    skip: request.Page * request.Take,
    take: request.Take,
  };
}

export function sortDirection(sortBy: string): 'asc' | 'desc' {
  return String(sortBy).toLowerCase() === 'desc' ? 'desc' : 'asc';
}

export function nullableInt(value: string | number | null | undefined): number | null {
  return parsePositiveInt(value);
}
