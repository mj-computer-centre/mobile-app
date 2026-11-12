import { describe, expect, it } from 'vitest';

import { toCsv } from './to-csv';

interface Student {
  name: string;
  phone: string | null;
  age?: number;
}

const columns = [
  { header: 'Name', value: (s: Student) => s.name },
  { header: 'Phone', value: (s: Student) => s.phone },
  { header: 'Age', value: (s: Student) => s.age },
];

describe('toCsv', () => {
  it('writes a header and one line per row', () => {
    expect(toCsv([{ name: 'Asha', phone: '9876543210', age: 19 }], columns)).toBe(
      'Name,Phone,Age\r\nAsha,9876543210,19\r\n',
    );
  });

  it('quotes commas, quotes and line breaks', () => {
    expect(toCsv([{ name: 'Kumar, "Ravi"\nJr', phone: null }], columns)).toBe(
      'Name,Phone,Age\r\n"Kumar, ""Ravi""\nJr",,\r\n',
    );
  });

  it('neutralises spreadsheet formulas', () => {
    expect(toCsv([{ name: '=HYPERLINK("x")', phone: '+919876543210' }], columns)).toBe(
      'Name,Phone,Age\r\n"\'=HYPERLINK(""x"")",\'+919876543210,\r\n',
    );
  });
});
