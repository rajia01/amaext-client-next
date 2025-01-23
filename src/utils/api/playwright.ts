
import { BACKEND_DOMAIN, token } from '../../../urls';
import axios from 'axios';


export const getAllTableCounts = async (source: string) => {
    const { data } = await axios.get(
      `${BACKEND_DOMAIN}/tables/row-count/?source=${source}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
            Authorization: token,
        },
      }
    );

    return { data: data.data };
  };

