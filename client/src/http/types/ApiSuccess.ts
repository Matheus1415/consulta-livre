export interface ApiSuccess<DataType = unknown> {
    status: string,
    message: string,
    data: DataType
}