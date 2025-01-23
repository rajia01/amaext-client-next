export const shortenUrl = (url: string): string => {
  const regex = /seller=([A-Z0-9]+).+urlId=(\d+)/;
  const match = url.match(regex);

  if (match) {
    const sellerId = match[1];
    const urlId = match[2];
    return `${sellerId}_${urlId}`;
  } else {
    throw new Error('Invalid URL format');
  }
};
