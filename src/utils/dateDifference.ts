export const getCurrentDateTime = () => {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
export const getDifference = (dateTime1:string, dateTime2:string) =>  {
    if (dateTime2==null){   
        return Number.MAX_SAFE_INTEGER
    }
    const date1 = new Date(dateTime1);
    const date2 = new Date(dateTime2);
  
    const diffInMs = date1.getTime() - date2.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    return diffInMinutes;
  }