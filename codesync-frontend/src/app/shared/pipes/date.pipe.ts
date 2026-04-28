import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianDate',
  standalone: true
})
export class IndianDatePipe implements PipeTransform {

  transform(value: string | Date | null, format: string = 'datetime'): string {
    if (!value) return '—';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };

    if (format === 'date') {
      options.hour = undefined;
      options.minute = undefined;
      options.second = undefined;
    } else if (format === 'time') {
      return date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } else if (format === 'datetime') {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
    } else if (format === 'short') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleString('en-IN', options);
  }
}