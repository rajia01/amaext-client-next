// Define the type for a column entry
export type Column = {
  type: string;
  null_count: number;
  column_name: string;
  not_null_count: number;
};

// Define the type for a bucket
export type Bucket = {
  columns: Column[];
  Pivot_Columns: string[];
  Common_Null_Count: number;
  Uncommon_Null_Count: number;
  Column_Inter_Dependency: string | number; // Updated to accept both string and number
};

// Define the response type for the backend data
export type BackendDataResponse = {
  buckets: Record<string, Bucket>;
  [key: string]: any; // To allow indexing by string
};

// Define the type for a bucket comment
export type BucketComment = {
  flag: string;
  text: string;
  'time-stamp': string;
};

// Define the response type for bucket comments
export type BucketCommentResponse = Record<
  string,
  {
    columns: string[];
    final_flag: boolean;
    bucket_comments: BucketComment[];
    bucket_comment_count: number;
  }
>;
