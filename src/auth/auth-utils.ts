import bcrypt from 'bcryptjs';

const salt = "$2a$10$mjBiK50OQB2g.s.QXSV8zu";

export function hashPassword(password: string) {
  let hash = bcrypt.hashSync(password, salt);

  return hash;
};

export function checkPassword(password: string, hash: string) {
  const hashedPass = hashPassword(password);

  return (hashedPass === hash);
}