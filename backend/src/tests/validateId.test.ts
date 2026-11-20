import { Request, Response, NextFunction } from 'express';
import { validateId } from '../middlewares/validateId';

describe('Validação de IDs', () => {
  const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }) as unknown as Response;

  it('deve aceitar ID positivo', () => {
    const req = {
      params: { id: '3' },
    } as unknown as Request;

    const res = createResponse();
    const next = jest.fn() as NextFunction;

    validateId('id')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve rejeitar letras', () => {
    const req = {
      params: { id: 'abc' },
    } as unknown as Request;

    const res = createResponse();
    const next = jest.fn() as NextFunction;

    validateId('id')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve rejeitar zero', () => {
    const req = {
      params: { id: '0' },
    } as unknown as Request;

    const res = createResponse();
    const next = jest.fn() as NextFunction;

    validateId('id')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve rejeitar ID negativo', () => {
    const req = {
      params: { id: '-1' },
    } as unknown as Request;

    const res = createResponse();
    const next = jest.fn() as NextFunction;

    validateId('id')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});