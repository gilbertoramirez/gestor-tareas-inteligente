import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        uid: string;
        email?: string;
      };
    }
  }
}

export {};