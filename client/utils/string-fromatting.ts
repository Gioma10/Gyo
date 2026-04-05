export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const lowercase = (str: string) => str.toLowerCase();

export const uppercase = (str: string) => str.toUpperCase();

export const truncate = (str: string, length: number) =>
  str.length > length ? str.slice(0, length) + "..." : str;

export const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

export const trim = (str: string) => str.trim();

export const isEmpty = (str: string) => str.trim().length === 0;
