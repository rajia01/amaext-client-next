export const convertToCSV = (data: any[]) => {
    if (data.length === 0) {
      return '';
    }
    if (typeof data[0] === 'string') {
      return 'datapoint\n' + data.join('\n');
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };