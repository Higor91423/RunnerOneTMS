import knex from 'knex';
import knexConfig from '../../knexfile';
import { env } from './env';

const environment = env.NODE_ENV === 'test' ? 'development' : env.NODE_ENV;
export const db = knex(knexConfig[environment] || knexConfig.development);