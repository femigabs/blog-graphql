import { ApolloServer } from "apollo-server";
import { schema, config, Logger } from './config';
import { context } from "./config/context";   

const port = config.PORT || 3100;

const logger = Logger.createLogger({ label: 'BLOG GRAPHQL' });

const server = new ApolloServer({
    schema,
    context,
});

server.listen({port}).then(({ url }) => {
    logger.info(`🚀  Server ready at ${url}`);
});

export default server;
