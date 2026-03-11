export const PASSWORD_REQUIREMENTS =
  "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.";

export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character or symbol.";
  }

  return null;
}
