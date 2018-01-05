const buttonNameValidation = {
    required: true,
    maxLength: 20,
    validChars: {
        rule: /^[a-zA-Z0-9'`~".\-\s]+$/,
        message: 'Invalid character, please use alphabetic, space or one of the following: \', `, ~, ", ., -',
    },
}

export {
    buttonNameValidation
}