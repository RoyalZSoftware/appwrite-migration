class NotPresentError extends Error {
    constructor(key) {
        super(key + " is not present.");
        this.key = key;
    }
}

export function validatePresence(value, key) {
    if (value == undefined) {
        throw new NotPresentError(key);
    }
}