export function capitalize(str) {
  const head = str.substr(0, 1).toUpperCase()
  const tail = str.substr(1)
  return head.concat(tail)
}

export function validate({ required, maxLength, validChars }, str) {
  const errors = []
  const isLengthZero = str.length === 0
  const hasValidLength = str.length <= maxLength
  const hasOnlyValidChars = validChars.rule.test(str)
  if (required && isLengthZero) {
    errors.push('Blank input, please fill')
  }
  if (!hasValidLength) {
    errors.push(`Too many characters, please use ${maxLength} or less`)
  }
  if (!isLengthZero && !hasOnlyValidChars) {
    errors.push(validChars.message)
  }
  return errors
}

export function debounce(fn, delay) {
  let timeout
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(fn, delay, ...args)
  }
}
