import { Response } from 'express';

export class HttpResponse {
    public readonly statusCode: number;
    public readonly message: string | undefined;
    public readonly data: any;
    public readonly meta?: any;

    constructor(
        res: Response,
        {
            statusCode = 200,
            message,
            data = null,
            meta
        }: {
            statusCode?: number;
            message?: string;
            data?: any;
            meta?: any;
        }
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.meta = meta;

        let options = {};

        options['statusCode'] = this.statusCode;
        if (this.message) options['message'] = this.message;
        if (this.data) options['data'] = this.data;
        if (this.meta) options['meta'] = this.meta;

        res.status(statusCode).json(options);
    }
}

// Export response classes
export { DataResponse } from './data';
export { MessageResponse } from './message';

// Helper functions
export const dataResponse = (
    res: Response,
    data: any,
    message?: string,
    statusCode?: number,
    meta?: any
) => {
    return new HttpResponse(res, { data, message, statusCode, meta });
};

export const messageResponse = (
    res: Response,
    message?: string,
    statusCode?: number,
    meta?: any
) => {
    return new HttpResponse(res, { message, statusCode, meta });
};
