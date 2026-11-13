import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Usuários
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 150).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['ADMIN', 'OPERADOR', 'VISUALIZADOR']).notNullable().defaultTo('OPERADOR');
    table.boolean('active').notNullable().defaultTo(true);
    table.string('reset_token', 255).nullable();
    table.timestamp('reset_token_expires').nullable();
    table.timestamps(true, true);
  });

  // 2. Clientes
  await knex.schema.createTable('clients', (table) => {
    table.increments('id').primary();
    table.string('name', 160).notNullable();
    table.string('document', 20).notNullable().unique(); // CPF ou CNPJ limpo
    table.string('email', 150).notNullable();
    table.string('phone', 25).notNullable();
    table.string('zip_code', 15).notNullable();
    table.string('street', 180).notNullable();
    table.string('number', 20).notNullable();
    table.string('neighborhood', 100).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 2).notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  // 3. Motoristas
  await knex.schema.createTable('drivers', (table) => {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('cpf', 14).notNullable().unique();
    table.string('phone', 25).notNullable();
    table.string('cnh_number', 20).notNullable().unique();
    table.string('cnh_category', 5).notNullable(); // B, C, D, E
    table.date('cnh_expiration').notNullable();
    table.enum('status', ['DISPONIVEL', 'EM_VIAGEM', 'INATIVO']).notNullable().defaultTo('DISPONIVEL');
    table.timestamps(true, true);
  });

  // 4. Veículos
  await knex.schema.createTable('vehicles', (table) => {
    table.increments('id').primary();
    table.string('plate', 10).notNullable().unique();
    table.string('model', 100).notNullable();
    table.string('brand', 60).notNullable();
    table.enum('type', ['VUC', 'TOCO', 'TRUCK', 'CARRETA', 'UTILITARIO']).notNullable();
    table.decimal('capacity_kg', 10, 2).notNullable();
    table
      .enum('status', ['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'INATIVO'])
      .notNullable()
      .defaultTo('DISPONIVEL');
    table.timestamps(true, true);
  });

  // 5. Pedidos de Transporte
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.string('order_code', 30).notNullable().unique();
    table.integer('client_id').unsigned().notNullable().references('id').inTable('clients').onDelete('RESTRICT');
    table.integer('driver_id').unsigned().nullable().references('id').inTable('drivers').onDelete('SET NULL');
    table.integer('vehicle_id').unsigned().nullable().references('id').inTable('vehicles').onDelete('SET NULL');
    table.string('origin_address', 220).notNullable();
    table.string('destination_address', 220).notNullable();
    table.text('cargo_description').notNullable();
    table.decimal('cargo_weight_kg', 10, 2).notNullable();
    table.decimal('freight_value', 12, 2).notNullable().defaultTo(0);
    table.date('pickup_date').notNullable();
    table.date('estimated_delivery_date').notNullable();
    table.timestamp('delivered_at').nullable();
    table
      .enum('status', ['PENDENTE', 'EM_COLETA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO'])
      .notNullable()
      .defaultTo('PENDENTE');
    table.timestamps(true, true);
  });

  // 6. Histórico de Status dos Pedidos
  await knex.schema.createTable('order_status_history', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.string('previous_status', 30).nullable();
    table.string('new_status', 30).notNullable();
    table.text('notes').nullable();
    table.integer('changed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_status_history');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.dropTableIfExists('drivers');
  await knex.schema.dropTableIfExists('clients');
  await knex.schema.dropTableIfExists('users');
}