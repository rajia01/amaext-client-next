export type TablesDetails = {
    table_name: string,
    row_count: number,
    columns_list: any[],
    last_present_time: any
}[]

export type TableCountByName = {
    row_count: number
}

export type ThirdPartyDetails = {
    source_name: string,
    total_records_count: number,
    created_at: any,
    modified_at: any
    columns_list: any[]
}