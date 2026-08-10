import bcrypt from 'bcryptjs';

// Cost 10 (bcrypt's own recommended default) rather than 12: bcryptjs is a
// pure-JS implementation with no native bindings, meaningfully slower than
// native bcrypt, and this project runs as a single Vercel Hobby-plan
// function with a hard, non-configurable 10s execution limit — cost 12
// eating a large, CPU-throttle-dependent chunk of that budget on every
// register/login is a real risk, not just a theoretical one.
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
