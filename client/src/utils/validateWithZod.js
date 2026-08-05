/**
 * Runs a Zod schema against form data and returns either
 * { success: true, data } or { success: false, errors: { field: message } }
 * matching the shape your components already use with setErrors().
 */
export function validateWithZod(schema, data) {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "form";
    if (!errors[field]) errors[field] = issue.message;
  }

  return { success: false, errors };
}