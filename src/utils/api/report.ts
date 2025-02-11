import axios from 'axios';

// ================================= Get columnwise record data =================================
export const getDataView = async (
  tableName: string,
  taskId: number,
  id: string,
) => {
  try {
    const response = await axios.get(
      `http://192.168.1.160:8000/${tableName}/${taskId}/sr/${id}`,
    );
    console.log('DB Record: ', response.data);
    return response.data;
    //
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};

// ================================= Create comment and save in database =================================
export const postComment = async (
  tableName: string,
  taskId: number,
  columnName: string[],
  srId: number,
  comment: string,
) => {
  if (!comment.trim()) return;

  try {
    await axios.post(
      `http://192.168.1.160:8000/${tableName}/${taskId}/comment/${columnName}/${srId}`,
      { comments: comment },
    );
    alert('Comment added succesfully!');
    return;
    //
  } catch (error) {
    console.error('Error saving comment: ', error);
    throw new Error('Error saving comment');
  }
};

// ================================= Get Comments columnwise to the ids =================================
export const getColumnwiseComments = async (
  tableName: string,
  taskId: number,
  columnName: string[],
) => {
  try {
    const response = await axios.get(
      `http://192.168.1.160:8000/${tableName}/${taskId}/comment/${columnName}`,
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
    //
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};

// ====================================== Null Count columnwise ======================================
export const fetchPaginatedData = async (
  tableName: string,
  taskId: number,
  page: number,
  rowsPerPage: number,
  selectedBucket: string, // Add selected bucket
) => {
  try {
    console.log(
      `Fetching paginated data for ${tableName}, Task ID: ${taskId}, Page: ${page}, Bucket: ${selectedBucket}`,
    );

    const response = await axios.get(
      `http://192.168.1.160:8000/${tableName}/task_id/${taskId}`,
      {
        params: { page_no: page, page_per: rowsPerPage },
      },
    );

    const data = response.data;

    // Get only the selected bucket's columns
    const selectedColumns = data.buckets[selectedBucket]?.columns || [];

    return {
      total_count: selectedColumns.length,
      items: selectedColumns,
      total_items: selectedColumns.length,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};

// ================================= Fetch comment count =================================
export const getCommentCount = async (tableName: string, taskId: number) => {
  try {
    const response = await axios.get(
      `http://192.168.1.160:8000/${tableName}/${taskId}/total-comments`,
    );
    // Parse the stringified JSON object inside total_comments_by_columns
    const commentCounts = JSON.parse(
      response.data[0].total_comments_by_columns,
    );
    return commentCounts;
    //
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching data',
    );
  }
};

// ================================= Fetch Null Records =================================

export const fetchNullRecords = async (
  tableName: string,
  taskId: number,
  columnName: string[], // Accepts multiple columns
  page: number,
  rowsPerPage: number,
) => {
  const response = await axios.get(
    `http://192.168.1.160:8000/${tableName}/${taskId}/columns`,
    {
      params: {
        columns: columnName, // Ensure columns are properly formatted
        page_no: page,
        page_per: rowsPerPage,
      },
      paramsSerializer: (params) => {
        return Object.keys(params)
          .map((key) =>
            Array.isArray(params[key])
              ? params[key]
                  .map((val: string) => `${key}=${encodeURIComponent(val)}`)
                  .join('&')
              : `${key}=${encodeURIComponent(params[key])}`,
          )
          .join('&');
      },
    },
  );

  console.log(response.data.items);

  console.log('Fetched Null Records:', response.data);
  return response.data;
};

// ================================= Fetch Bucketwise Data =================================

export const fetchBackendData = async (tableName: string, taskId: number) => {
  if (!tableName || !taskId) return null; // Ensure table name and task ID are provided

  try {
    const { data } = await axios.get(
      `http://192.168.1.160:8000/${tableName}/task_id/${taskId}/`,
    );
    return data;
  } catch (error) {
    console.error('Error fetching backend data:', error);
    throw error; // Ensure the error is handled in the caller
  }
};
