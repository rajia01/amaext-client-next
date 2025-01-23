
import { BACKEND_DOMAIN, token } from '../../../urls';
import axios from 'axios';


export const getAllThirdPartyCounts = async () => {
    const { data } = await axios.get(
      `${BACKEND_DOMAIN}/thirdparty/`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
            Authorization: token,
        },
      }
    );

    return { data: data.data };
  };

