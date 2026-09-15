export interface ApiError {
    status: string,
    message: string,
    errors?: ValidationError[]
}

type ValidationError = {
    [key: string]: string[]
}