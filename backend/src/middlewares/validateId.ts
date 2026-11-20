import { Request, Response, NextFunction } from 'express';

export const validateId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params[paramName]);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID inválido.',
      });
    }

    return next();
  };
};