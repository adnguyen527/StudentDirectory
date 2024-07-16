export function convertToDate(dateString) {
    const [month, day, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}