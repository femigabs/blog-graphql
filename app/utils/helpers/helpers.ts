import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

const secret = config.JWT_SECRET;
const expiry = config.JWT_EXPIRY_DURATION;

/**
 *Contains Helper methods
 * @class Helper
 */
class Helper {
  static generateRandomNumber(size: number) {
    let code = '';
    code += crypto.randomBytes(256).readUIntBE(0, 6);
    return Number.parseInt(code.slice(0, size), 10);
  }

  static hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  static verifyPassword(password: string, hashedPassword: string) {
    const validPassword = bcrypt.compareSync(password, hashedPassword);
    if (validPassword) {
      return true;
    }
    return false;
  };

  static generateToken(payload: any) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  };
}

export default Helper;
