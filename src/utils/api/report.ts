import axios from 'axios';

export const getDataView = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:8000/sr/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};
