import { validateEmail, validatePassword } from "../validateLogin";

describe("Validation Login", () => {

  // Tests for validateEmail function
  describe("validateEmail", () => {
    test("should return an empty string for a valid email", () => {
      expect(validateEmail("test@example.com", true)).toBe("");
    });

    test('should return "Enter a valid email" for an invalid email', () => {
      expect(validateEmail("invalid-email", true)).toBe("Enter a valid email");
    });

    test('should return "Email is required" if email is missing and submitted is true', () => {
      expect(validateEmail("", true)).toBe("Email is required");
    });

    test('should return "Required" if email is missing and submitted is false', () => {
      expect(validateEmail("", false)).toBe("Required");
    });
  });

  // Tests for validatePassword function
  describe("validatePassword", () => {
    test("should return an empty string when a password is provided", () => {
      expect(validatePassword("securePassword123", true)).toBe("");
    });

    test('should return "Password is required" if password is missing and submitted is true', () => {
      expect(validatePassword("", true)).toBe("Password is required");
    });

    test('should return "Required" if password is missing and submitted is false', () => {
      expect(validatePassword("", false)).toBe("Required");
    });
  });
});
