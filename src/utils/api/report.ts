import axios from 'axios';

const url = 'http://127.0.0.1:8000';

// ================================= Get columnwise record data =================================
export const getDataView = async (
  tableName: string,
  taskId: number,
  id: string,
) => {
  try {
    const response = await axios.get(`${url}/${tableName}/${taskId}/sr/${id}`);
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
export const addComment = async (
  tableName: string,
  taskId: number,
  bucketName: string,
  commentText: string,
  columnName?: string, // Optional parameter
) => {
  const params = new URLSearchParams();
  params.append('bucket_name', bucketName);
  if (columnName) {
    params.append('column_name', columnName);
  }

  const payload = {
    comments: commentText, // Only `comments` should be in the body
  };

  try {
    const response = await axios.post(
      `${url}/${tableName}/${taskId}/comment/?${params.toString()}`, // Attach params here
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw error;
  }
};

// ================================= Get Comments columnwise to the ids =================================

export const getColumnwiseComments = async (
  tableName: string,
  taskId: number,
  bucketName: string,
  columnName?: string,
) => {
  try {
    const response = await axios.get(
      `${url}/${tableName}/${taskId}/get-comment/`,
      {
        params: {
          bucket_name: bucketName,
          ...(columnName && { column_name: columnName }), // Include column_name only if provided
        },
      },
    );

    return response.data; // Return the response data properly
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error; // Re-throw the error for handling in the calling function
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

    const response = await axios.get(`${url}/${tableName}/task_id/${taskId}`, {
      params: { page_no: page, page_per: rowsPerPage },
    });

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
export const getCommentCount = async (
  tableName: string,
  taskId: number,
  bucketName: string,
  columnName?: string,
) => {
  try {
    const response = await axios.get(
      `${url}/${tableName}/${taskId}/total-comments`,
      {
        params: {
          bucket_name: bucketName,
          ...(columnName && { column_name: columnName }), // Include column_name only if provided
        },
      },
    );

    return response.data?.total_comment_count || 0;
  } catch (error) {
    console.error(`Error fetching comments for ${bucketName}:`, error);
    return 0;
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
  const response = await axios.get(`${url}/${tableName}/${taskId}/columns`, {
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
  });

  console.log(response.data.items);

  console.log('Fetched Null Records:', response.data);
  return response.data;
};

// ================================= Fetch Bucketwise Data =================================

export const fetchBackendData = async (tableName: string, taskId: number) => {
  if (!tableName || !taskId) return null; // Ensure table name and task ID are provided

  try {
    const { data } = await axios.get(`${url}/${tableName}/task_id/${taskId}/`);
    return data;
  } catch (error) {
    console.error('Error fetching backend data:', error);
    throw error; // Ensure the error is handled in the caller
  }
};
