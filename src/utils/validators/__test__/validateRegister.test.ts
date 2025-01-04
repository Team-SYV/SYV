import {
  validateConfirmPassword,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../validateRegister";

describe("Validation Registration", () => {

  // Tests for validateFirstName
  describe("validateFirstName", () => {
    test("should return an empty string if firstname is provided", () => {
      expect(validateFirstName("John", true)).toBe("");
    });

    test('should return "Firstname is required" if firstname is missing and submitted is true', () => {
      expect(validateFirstName("", true)).toBe("Firstname is required");
    });

    test('should return "Required" if firstname is missing and submitted is false', () => {
      expect(validateFirstName("", false)).toBe("Required");
    });
  });

  // Tests for validateLastName
  describe("validateLastName", () => {
    test("should return an empty string if lastname is provided", () => {
      expect(validateLastName("Doe", true)).toBe("");
    });

    test('should return "Lastname is required" if lastname is missing and submitted is true', () => {
      expect(validateLastName("", true)).toBe("Lastname is required");
    });

    test('should return "Required" if lastname is missing and submitted is false', () => {
      expect(validateLastName("", false)).toBe("Required");
    });
  });

  // Tests for validateEmail
  describe("validateEmail", () => {
    test("should return an empty string if email is valid", () => {
      expect(validateEmail("test@example.com", true)).toBe("");
    });

    test('should return "Enter a valid email" if email is invalid', () => {
      expect(validateEmail("invalid-email", true)).toBe("Enter a valid email");
    });

    test('should return "Email is required" if email is missing and submitted is true', () => {
      expect(validateEmail("", true)).toBe("Email is required");
    });

    test('should return "Required" if email is missing and submitted is false', () => {
      expect(validateEmail("", false)).toBe("Required");
    });
  });

  // Tests for validatePassword
  describe("validatePassword", () => {
    test("should return an empty string if password meets all requirements", () => {
      expect(validatePassword("Password1", true)).toBe("");
    });

    test("should return an error message if password is too short", () => {
      expect(validatePassword("Pass1", true)).toBe(
        "Password must include at least 8 characters."
      );
    });

    test("should return an error message if password lacks a capital letter", () => {
      expect(validatePassword("password1", true)).toBe(
        "Password must include a capital letter."
      );
    });

    test("should return an error message if password lacks a number", () => {
      expect(validatePassword("Password", true)).toBe(
        "Password must include a number."
      );
    });
  });

  // Tests for validateConfirmPassword
  describe("validateConfirmPassword", () => {
    test("should return an empty string if passwords match", () => {
      expect(validateConfirmPassword("Password1", "Password1", true)).toBe("");
    });

    test('should return "Passwords do not match" if passwords do not match', () => {
      expect(validateConfirmPassword("Password1", "Password2", true)).toBe(
        "Passwords do not match"
      );
    });

    test('should return "Confirm Password is required" if confirmPassword is missing and submitted is true', () => {
      expect(validateConfirmPassword("Password1", "", true)).toBe(
        "Confirm Password is required"
      );
    });

    test('should return "Required" if confirmPassword is missing and submitted is false', () => {
      expect(validateConfirmPassword("Password1", "", false)).toBe("Required");
    });
  });
});
