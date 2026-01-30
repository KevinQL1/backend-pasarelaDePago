import { v4 as uuidv4 } from 'uuid';

export function generateShortUUID(min = 17, max = 20) {
    const fullUUID = uuidv4().replace(/-/g, '');
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    return fullUUID.slice(0, length);
}
