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

export const fetchBucketData = async (tableName: string, taskId: number) => {
  if (!tableName || !taskId) return null; // Ensure table name and task ID are provided

  try {
    const { data } = await axios.get(`${url}/${tableName}/task_id/${taskId}/`);
    return data;
  } catch (error) {
    console.error('Error fetching backend data:', error);
    throw error; // Ensure the error is handled in the caller
  }
};
// ========================= Fetch Bucketwise Comments and Comment Count ==========================
export const fetchBucketComments = async (
  tableName: string,
  taskId: number,
) => {
  if (!tableName || !taskId) {
    throw new Error('Table name and task ID are required');
  }

  try {
    const { data } = await axios.get(
      `${url}/${tableName}/${taskId}/bucket-comments/`,
    );
    return data; // Returning the entire response object
  } catch (error) {
    console.error('Error fetching bucket comments:', error);
    throw new Error('Failed to fetch bucket comments. Please try again.');
  }
};

// ========================= Fetch Columnwise Comments and Comment Count ==========================
export const fetchColumnComments = async (
  tableName: string,
  taskId: number,
  bucketName: string,
) => {
  if (!tableName || !taskId || !bucketName) {
    throw new Error('Table name, task ID, and bucket name are required');
  }

  try {
    const { data } = await axios.get(
      `${url}/${tableName}/${taskId}/column-comments/`,
    );

    if (!data[bucketName]) {
      throw new Error(`Bucket "${bucketName}" not found in response`);
    }

    return { [bucketName]: data[bucketName] }; // Return only the requested bucket
  } catch (error) {
    console.error('Error fetching column comments:', error);
    throw new Error('Failed to fetch column comments. Please try again.');
  }
};
