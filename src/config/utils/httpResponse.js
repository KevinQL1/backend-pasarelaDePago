/**
 * Lista blanca de orígenes permitidos
 * SOLO estos frontends pueden consumir la API
 */
const allowedOrigins = [
    'http://localhost:5173' // Vite en local
];

/**
 * Genera los headers CORS dinámicamente
 * según el origin que envía el navegador
 */
const getCorsHeaders = (origin) => {
    // Si el origin está permitido, devolvemos headers CORS completos
    if (allowedOrigins.includes(origin)) {
        return {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        };
    }

    // Si el origin NO está permitido, no se expone CORS
    return {
        'Content-Type': 'application/json'
    };
};

/**
 * Respuesta 200 OK
 * Se usa cuando todo sale bien
 */
const getEventOrigin = (event) => (event?.headers?.origin || event?.headers?.Origin);

const ok = (event, body) => ({
    statusCode: 200,
    headers: getCorsHeaders(getEventOrigin(event)),
    body: JSON.stringify(body)
});

/**
 * Respuesta 400 Bad Request
 * Se usa cuando el cliente envía datos incorrectos
 */
const badRequest = (event, error, path = '/') => ({
    statusCode: 400,
    headers: getCorsHeaders(getEventOrigin(event)),
    body: JSON.stringify({
        type: 'urn:problem:bad-request',
        title: 'Bad Request',
        detail: error.message,
        status: 400,
        instance: path
    })
});

/**
 * Respuesta 404 Not Found
 * Se usa cuando no se encuentra un recurso
 */
const notFound = (event, error, path = '/') => ({
    statusCode: 404,
    headers: getCorsHeaders(getEventOrigin(event)),
    body: JSON.stringify({
        type: 'urn:problem:not-found',
        title: 'Not Found',
        detail: error.message,
        status: 404,
        instance: path
    })
});

/**
 * Respuesta 500 Server Error
 * Se usa cuando ocurre un error inesperado en el backend
 */
const serverError = (event, path = '/') => ({
    statusCode: 500,
    headers: getCorsHeaders(getEventOrigin(event)),
    body: JSON.stringify({
        type: 'urn:problem:server-error',
        title: 'Server Error',
        detail: 'An unexpected error has occurred, contact the administrator.',
        status: 500,
        instance: path
    })
});

/**
 * Exportación de helpers HTTP
 */
export {
    ok,
    badRequest,
    notFound,
    serverError
};
