import { validateEmail, validatePassword } from "../validateLogin";

describe("Validation Functions", () => {
  
  test("validateEmail should return empty string if email is valid", () => {
    expect(validateEmail("test@example.com", true)).toBe("");
  });

  test('validateEmail should return "Enter a valid email" if email is invalid', () => {
    expect(validateEmail("invalid-email", true)).toBe("Enter a valid email");
  });

  test('validateEmail should return "Email is required" if email is missing and submitted is true', () => {
    expect(validateEmail("", true)).toBe("Email is required");
  });

  test('validateEmail should return "Required" if email is missing and submitted is false', () => {
    expect(validateEmail("", false)).toBe("Required");
  });

  test("validatePassword should return empty string if password is provided", () => {
    expect(validatePassword("securePassword123", true)).toBe("");
  });

  test('validatePassword should return "Password is required" if password is missing and submitted is true', () => {
    expect(validatePassword("", true)).toBe("Password is required");
  });

  test('validatePassword should return "Required" if password is missing and submitted is false', () => {
    expect(validatePassword("", false)).toBe("Required");
  });
});
 