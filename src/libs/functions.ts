// Define a function that takes a string from HTML and returns a clean string
export function cleanString(str: string): string {
  return str
    .replace(/(\r|\n|\r)/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractDomainFromEmail(email: string): string {
  return email.split('@')[1];
}

export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (cpf === '00000000000') return false;
  let sum = 0;
  let rest: number;
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) {
    rest = 0;
  }
  if (rest !== parseInt(cpf.substring(9, 10))) {
    return false;
  }
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) {
    rest = 0;
  }
  if (rest !== parseInt(cpf.substring(10, 11))) {
    return false;
  }
  return true;
}

export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
}
