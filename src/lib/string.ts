export function createRandomString() {
  return '_' + Math.random().toString(36).substring(2, 9);
}
