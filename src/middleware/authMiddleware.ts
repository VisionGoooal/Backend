import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authorization = req.header("authorization");
    const token = authorization && authorization.split(" ")[1];
    if (!token) {
      res.status(401).send("Access Denied");
      return;
    }
    if (!process.env.JWT_SECRET) {
      res.status(500).send("server error");
      return;
    }
  
    interface Payload extends JwtPayload {
        _id: string;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if (err) {
            res.status(401).send('Access Denied');
            return;
        }
        if (decoded) {
            const payload = decoded as Payload;
            req.params.userId = payload._id;
            next();
        }
    });
  };