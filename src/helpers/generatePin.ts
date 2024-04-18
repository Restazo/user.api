const isValidPin = (pin: number): boolean => {
  const pinStr = pin.toString();

  // Check if all digits are the same (e.g., 22222)
  if (/^(\d)\1{4}$/.test(pinStr)) {
    return false;
  }

  // Check for alternating repeating numbers (e.g., 23232, 32323)
  if (
    pinStr[0] === pinStr[2] &&
    pinStr[2] === pinStr[4] &&
    pinStr[1] === pinStr[3]
  ) {
    return false;
  }

  // Check for consecutive ascending or descending numbers (e.g., 12345, 54321)
  const isAscending = "1234567890".includes(pinStr);
  const isDescending = "9876543210".includes(pinStr);
  if (isAscending || isDescending) {
    return false;
  }

  // Check for repeated pairs or triples (e.g., 11223, 33112)
  if (/(\d)\1{1}(\d)\2{1}/.test(pinStr) || /(\d)\1{2}/.test(pinStr)) {
    return false;
  }

  // Check for simple arithmetic sequences
  let isArithmetic = true;
  const firstDifference = pinStr.charCodeAt(1) - pinStr.charCodeAt(0);
  for (let i = 2; i < pinStr.length; i++) {
    if (pinStr.charCodeAt(i) - pinStr.charCodeAt(i - 1) !== firstDifference) {
      isArithmetic = false;
      break;
    }
  }
  if (isArithmetic) {
    return false;
  }

  // Check for palindromes
  if (pinStr === pinStr.split("").reverse().join("")) {
    return false;
  }

  return true;
};

export const generatePin = (): number => {
  let pin: number;
  do {
    pin = Math.floor(Math.random() * 90000) + 10000;
  } while (!isValidPin(pin));
  return pin;
};
