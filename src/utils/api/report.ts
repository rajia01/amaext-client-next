import axios from 'axios';

export const getDataView = async (
  tableName: string,
  taskId: number,
  id: string,
) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/${tableName}/${taskId}/sr/${id}`,
    );
    console.log('DB Record: ', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};

export const postComment = async (
  tableName: string,
  taskId: number,
  columnName: string,
  srId: number,
  comment: string,
) => {
  if (!comment.trim()) return;

  try {
    await axios.post(
      `http://localhost:8000/${tableName}/${taskId}/comment/${columnName}/${srId}`,
      { comments: comment },
    );
    alert('Comment added succesfully!');
    return;
  } catch (error) {
    console.error('Error saving comment: ', error);
    throw new Error('Error saving comment');
  }
};

export const getColumnwiseComments = async (
  tableName: string,
  taskId: number,
  columnName: string,
) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/${tableName}/${taskId}/comment/${columnName}`,
    );

    const comments = JSON.parse(response.data[0].show_comments);

    // Extract the ids and comments
    const idsAndComments = comments.map(
      (comment: { id: number; comment: string }) => ({
        id: comment.id,
        comment: comment.comment,
      }),
    );
    return idsAndComments;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};
