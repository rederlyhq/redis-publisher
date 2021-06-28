import { Queue, Worker } from 'bullmq';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import Redis from 'ioredis';

export default async function clients(fastify: FastifyInstance): Promise<void> {
    // The Backend will post a bunch of jobs here and subscribe to their updates here.
    fastify.get('/', { websocket: true, schema: { querystring: { token: { type: 'string' } }} }, async function (connection: SocketStream, request: FastifyRequest<{Querystring: {token: string}}>) {
        console.log('Getting base websocket route.');
        const redis = new Redis();

        redis.on('message', (channel, message) => {
            console.log(`Received ${message} from ${channel}`);
        });

        // There's also an event called 'messageBuffer', which is the same as 'message' except
        // it returns buffers instead of strings.
        // It's useful when the messages are binary data.
        redis.on('messageBuffer', (channel, message) => {
            // Both `channel` and `message` are buffers.
            console.log(channel, message);
        });

        connection.on('connection', (message: unknown) => {
            console.log('Got a server connection event.');
        });

        connection.socket.on('open', (message: unknown) => {
            console.log('Got an open event.');
            connection.socket.send('New message');
        });

        connection.socket.on('message', (message: string) => {
            const jwt = fastify.jwt.decode<{data: {[x: string]: any}, iat: number, exp: number}>(message);
            console.log(jwt);

            if (!jwt) return;
            redis.publish(`user/${jwt.data.userId}`, JSON.stringify(jwt.data));
        });
    });
}
