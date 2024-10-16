export const validateEmail = (email: string, submitted: boolean): string => {
  if (!email) 
    return submitted ? "Email is required" : "Required";
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email) ? "" : "Enter a valid email";
};

export const validatePassword = (
  password: string,
  submitted: boolean
): string => {
  return password ? "" : submitted ? "Password is required" : "Required";
};
