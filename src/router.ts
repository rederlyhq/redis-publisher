import { FastifyInstance } from 'fastify';
import clients from './routes/clients';

export default async function router(fastify: FastifyInstance): Promise<void> {
    fastify.register(clients, { prefix: '/' });
}
