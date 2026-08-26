//NOTE: HIGHER ORDER FUNCTION: const fn =  (pr1, pr2) => (pr3,pr4) => {}
// function returning other function(higher order function)
// how to call: fn(arg1,arg2)(arg3,arg4)


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
        return next(
            new AppError(
                'Invalid request data.',
                400,
                'VALIDATION_ERROR',
                null,
                errors
            )
        );
    }

    if(source === 'query') { //.qeury
        // NOTE: In Express 5, req.query is read-only
        // this method replaces values key-wise in req.source object, keeping the object(req.source) intact
        // ie the prev code referencing req.source will now reference to new data
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query,result.data);
    } else { //.body, .params
        // this method replaces object(req.source) completely with new object(result.data)
        // ie the prev code referencing req.source will points to the old object
        req[source] = result.data;
    }

    next();
};

module.exports = { validate };