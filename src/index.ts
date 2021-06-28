import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import router from './router';
import fastifyjwt from 'fastify-jwt';
import fastifyws from 'fastify-websocket';
import querystring from 'querystring';

const server: FastifyInstance = Fastify({
    logger: true,
});

server.register(fastifyjwt, {
    secret: 'TODO: Change this secret'
});

server.register(fastifyws, {
    errorHandler: function (error, conn /* SocketStream */, _req /* FastifyRequest */, _reply /* FastifyReply */) {
        console.log('Error', error);
        // Do stuff
        // destroy/close connection
        conn.destroy(error);
    },
    options: {
        maxPayload: 1048576, // we set the maximum allowed messages size to 1 MiB (1024 bytes * 1024 bytes)
        verifyClient: function (info: { req: { headers: { [x: string]: string; }, url: string; }; }, next: (arg0: boolean) => void) {
            console.log('Verify client');
            const token = querystring.parse(info.req.url.slice(2)).token;

            // Token not necessary for internally locked down services.
            // if (typeof token !== 'string') {
            //     console.log('Token was in invalid format.', token);
            //     return next(false);
            // }

            // if (!server.jwt.verify(token)) {
            //     console.log('An invalid token was passed.', token);
            //     return next(false);
            // }
            next(true);
        }
    }
});
server.register(router);

const start = async () => {
    try {
        console.log('Starting server');
        await server.listen(3010, '0.0.0.0');

        const address = server.server.address();
        const addressStr = typeof address === 'string' ? address : address?.address;
        const port = typeof address === 'string' ? address : address?.port;
        console.log(`Server listening on ${addressStr}:${port}`);

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
