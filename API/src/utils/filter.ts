export function filterAllowedFields<T>(
  data: any,
  allowedFields: (keyof T)[]
): Partial<T> {
  const filteredData: Partial<T> = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  return filteredData;
}
