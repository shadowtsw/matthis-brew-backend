export const dateParser = (
  date: string | Date,
  format: 'string' | 'number' | 'date' | 'bson' | 'mongoose' = 'string',
  order: Array<string> = ['DD', 'MM', 'YYYY'],
  seperator: '.' | ';' | '-' = '.'
): number | string | never | Date => {
  if (typeof date === 'string') {
    const dateArray: Array<string> = date.split(seperator);

    const indexYear = order.findIndex((v) => v === 'YYYY');
    const indexMonth = order.findIndex((v) => v === 'MM');
    const indexDay = order.findIndex((v) => v === 'DD');

    const year = Number(dateArray[indexYear]);
    const month =
      Number(dateArray[indexMonth]) === 0
        ? Number(dateArray[indexMonth])
        : Number(dateArray[indexMonth]) - 1;
    const day = Number(dateArray[indexDay]);

    const newDateMillis: Date = new Date(year, month, day);

    if (format === 'number') return newDateMillis.getTime();
    else if (format === 'string') return newDateMillis.toLocaleDateString();
    else if (format === 'date') return newDateMillis.toISOString();
    else if (format === 'mongoose') {
      if (dateArray[indexYear].length === 2) {
        dateArray[indexYear] = '20' + dateArray[indexYear];
      }
      return (
        dateArray[indexYear] +
        '-' +
        dateArray[indexMonth] +
        '-' +
        dateArray[indexDay]
      );
    } else {
      throw new Error('undefined Date format');
    }
  } else {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const parsedDate = year + '-' + month + '-' + day;
    return parsedDate;
  }
};
