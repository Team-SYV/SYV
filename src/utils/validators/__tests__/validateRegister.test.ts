import {
  validateConfirmPassword,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../validateRegister";

describe("Validation Functions", () => {
  test("validateFirstName should return empty string if firstname is provided", () => {
    expect(validateFirstName("Steve", true)).toBe("");
  });

  test('validateFirstName should return "Firstname is required" if firstname is missing and submitted is true', () => {
    expect(validateFirstName("", true)).toBe("Firstname is required");
  });

  test('validateFirstName should return "Required" if firstname is missing and submitted is false', () => {
    expect(validateFirstName("", false)).toBe("Required");
  });

  test("validateLastName should return empty string if lastname is provided", () => {
    expect(validateLastName("Yoshi", true)).toBe("");
  });

  test('validateLastName should return "Lastname is required" if lastname is missing and submitted is true', () => {
    expect(validateLastName("", true)).toBe("Lastname is required");
  });

  test('validateLastName should return "Required" if lastname is missing and submitted is false', () => {
    expect(validateLastName("", false)).toBe("Required");
  });

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

  test("validatePassword should return empty string if password meets all requirements", () => {
    expect(validatePassword("Password1", true)).toBe("");
  });

  test("validatePassword should return error message if password is too short", () => {
    expect(validatePassword("Pass1", true)).toBe(
      "Password must include at least 8 characters."
    );
  });

  test("validatePassword should return error message if password lacks capital letter", () => {
    expect(validatePassword("password1", true)).toBe(
      "Password must include a capital letter."
    );
  });

  test("validatePassword should return error message if password lacks number", () => {
    expect(validatePassword("Password", true)).toBe(
      "Password must include a number."
    );
  });

  test("validateConfirmPassword should return empty string if passwords match", () => {
    expect(validateConfirmPassword("Password1", "Password1", true)).toBe("");
  });

  test('validateConfirmPassword should return "Passwords do not match" if passwords do not match', () => {
    expect(validateConfirmPassword("Password1", "Password2", true)).toBe(
      "Passwords do not match"
    );
  });

  test('validateConfirmPassword should return "Confirm Password is required" if confirmPassword is missing and submitted is true', () => {
    expect(validateConfirmPassword("Password1", "", true)).toBe(
      "Confirm Password is required"
    );
  });

  test('validateConfirmPassword should return "Required" if confirmPassword is missing and submitted is false', () => {
    expect(validateConfirmPassword("Password1", "", false)).toBe("Required");
  });
});