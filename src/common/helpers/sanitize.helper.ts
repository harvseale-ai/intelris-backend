export const sanitize = (val: any): string => (typeof val === 'string' ? val.replace(/\u0000/g, '') : String(val ?? ''));
