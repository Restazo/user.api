const convertIntoNumbers = (
  inputs: Map<string, any>
): Map<string, number> | null => {
  const convertedMap = new Map<string, number>();

  for (const [key, value] of inputs.entries()) {
    const convertedValue = Number(value);
    if (isNaN(convertedValue)) {
      return null;
    }
    convertedMap.set(key, convertedValue);
  }

  return convertedMap;
};

export default convertIntoNumbers;
