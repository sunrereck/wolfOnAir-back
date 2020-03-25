import jwt from 'jsonwebtoken';
import { Context } from 'koa';

export const generateToken = (uid: number, userName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign({
      _id: uid,
      userName
    }, 'secret', {
      expiresIn: '7d',
      issuer: 'wolfonair-local',
      subject: 'user'
    }, (err, token) => {
      if (err) {
        reject(err);
      }

      resolve(token);
    })
  });
}

export const decodeToken = (token: string) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject();
    }
    
    jwt.verify(token, 'sceret', (err, decoded) => {
      if (err) {
        reject(err);
      }

      resolve(decoded);
    })
  });
};

export const setCookie = (ctx: Context, token: string) => {
  ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
}