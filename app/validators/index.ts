import { Request, Response, NextFunction } from 'express';

const baseValidator = async (
  schema:any, req: Request, res: Response, next: NextFunction, type: string
  ) => {
  try {
    const getReqType: Record<string, any>  = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    };
    getReqType[type] = await schema.validateAsync(getReqType[type]);
    return next();
  } catch (error) {
    throw new Error(error.message.replace(/[\"]/gi, ''));
  }
};

export default baseValidator;
