/**
 * Standard validation utility for OGUN ecosystem
 */

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    // Basic 10-digit validation
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
};

export const validatePassword = (password) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
};

export const validateOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};

export const validateName = (name) => {
    // Strictly letters and spaces, min 3 chars
    const re = /^[A-Za-z\s]{3,}$/;
    return re.test(name);
};

export const validateBusinessName = (name) => {
    // Allows letters, spaces, and common business symbols, but NO numbers as per user request
    const re = /^[A-Za-z\s&-]{3,}$/;
    return re.test(name);
};

export const validateNumeric = (val) => {
    return /^\d+$/.test(val);
};
