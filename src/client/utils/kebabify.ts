// Taken from https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
export const kebabify = (str: string) => str.replace(/[a-z][A-Z]/g, ($) => {
  return $.split('').join('-');
}).toLowerCase();
