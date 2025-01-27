export const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    // Check se mail presente
    if (!email || typeof email != 'string' || email.trim() === '') return false;

    // Check if the email is defined and not too long
    if (!email || email.length > 254) return false;

    // Use a single regex check for the standard email parts
    if (!emailRegex.test(email)) return false;

    // Split once and perform length checks on the parts
    const parts = email.split("@");
    if (parts[0].length > 64) return false;

    // Perform length checks on domain parts
    const domainParts = parts[1].split(".");
    if (domainParts.some(part => part.length > 63)) return false;

    // If all checks pass, the email is valid
    return true;
}

export const isPasswordValid = (password) => {
    // Controlla se la password è definita e se è una stringa
    if (!password || typeof password !== 'string' || password.trim() === '') {
        return { valid: false, message: 'Password non valida, deve essere una stringa.' };
    }

    // Controlla se la lunghezza è di almeno 8 caratteri
    if (password.length < 8) {
        return { valid: false, message: 'Password troppo corta, deve avere almeno 8 caratteri.' };
    }

    // Controlla se contiene almeno una lettera maiuscola
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'La password deve contenere almeno una lettera maiuscola.' };
    }

    // Controlla se contiene almeno una lettera minuscola
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'La password deve contenere almeno una lettera minuscola.' };
    }

    // Controlla se contiene almeno un numero
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'La password deve contenere almeno un numero.' };
    }

    // Controlla se contiene almeno un carattere speciale (facoltativo)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: 'La password deve contenere almeno un carattere speciale.' };
    }

    // Se tutte le condizioni sono soddisfatte
    return { valid: true };
};