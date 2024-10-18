const adjectives = ['Happy', 'Clever', 'Brave', 'Wise', 'Kind', 'Swift', 'Calm', 'Bright', 'Bold', 'Gentle'];
const nouns = ['Panda', 'Eagle', 'Tiger', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Lion', 'Owl', 'Hawk'];

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
}