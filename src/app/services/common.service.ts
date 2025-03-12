import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

generateRandomString(length: number) {
  // Validate input
  if (typeof length !== 'number' || length <= 0 || !Number.isInteger(length)) {
    throw new Error('Length must be a positive integer');
  }

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsetLength = charset.length;

  // Generate random indices using a cryptographically secure random number generator
  const randomIndices = Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map(value => value % charsetLength);

  // Map random indices to characters from the charset and join to form the random string
  return randomIndices.map(index => charset[index]).join('');
}
}
