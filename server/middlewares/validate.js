const { ZodError } = require('zod');

/**
 * Generic Zod-based request validator.
 * Usage: router.post('/route', validate(someZodSchema), controller)
 *
 * @param {*} schema - zod schema-> have method: .safeParse(source)
 * @param {*} source - what is the source key in req ie: req.body
 * @returns - validate error || next() with validated schema in request
 */
const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
        const firstIssue = result.error.issues[0];
        return res.status(400).json({
            message: firstIssue?.message || 'Invalid request data',
            errors: result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }

    if(source === 'query') {
        // NOTE: In Express 5, req.query is read-only
        // this method replaces values key-wise in req.source object, keeping the object(req.source) intact
        // ie the prev code referencing req.source will now reference to new data
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query,result.data);
    } else {
        // this method replaces object(req.source) completely with new object(result.data)
        // ie the prev code referencing req.source will points to the old object
        req[source] = result.data;
    }

    next();
};

module.exports = { validate };