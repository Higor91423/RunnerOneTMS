import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Limpeza respeitando chaves estrangeiras
  await knex('order_status_history').del();
  await knex('orders').del();
  await knex('vehicles').del();
  await knex('drivers').del();
  await knex('clients').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('Runner@2026', 10);

  // 1. Usuários iniciais
  const [adminUser, operatorUser] = await knex('users')
    .insert([
      {
        name: 'Administrador Runner One',
        email: 'admin@runnerone.com.br',
        password_hash: passwordHash,
        role: 'ADMIN',
        active: true,
      },
      {
        name: 'Operador Logístico',
        email: 'operador@runnerone.com.br',
        password_hash: passwordHash,
        role: 'OPERADOR',
        active: true,
      },
    ])
    .returning('*');

  // 2. Clientes
  const clients = await knex('clients')
    .insert([
      {
        name: 'Indústria Metalúrgica Horizonte Ltda',
        document: '12345678000190',
        email: 'logistica@horizonteind.com.br',
        phone: '(11) 3456-7890',
        zip_code: '06501-000',
        street: 'Av. Brasil',
        number: '1500',
        neighborhood: 'Centro',
        city: 'Santana de Parnaíba',
        state: 'SP',
        active: true,
      },
      {
        name: 'Distribuidora Paulista de Alimentos S.A.',
        document: '98765432000110',
        email: 'expedicao@paulistaalimentos.com.br',
        phone: '(11) 4154-2200',
        zip_code: '06455-000',
        street: 'Alameda Rio Negro',
        number: '850',
        neighborhood: 'Alphaville',
        city: 'Barueri',
        state: 'SP',
        active: true,
      },
      {
        name: 'Construtora Vértice Engenharia',
        document: '45678912000133',
        email: 'suprimentos@verticeeng.com.br',
        phone: '(19) 3211-9000',
        zip_code: '13010-000',
        street: 'Rua Conceição',
        number: '410',
        neighborhood: 'Centro',
        city: 'Campinas',
        state: 'SP',
        active: true,
      },
    ])
    .returning('*');

  // 3. Motoristas
  const drivers = await knex('drivers')
    .insert([
      {
        name: 'Carlos Eduardo Mendes',
        cpf: '32165498701',
        phone: '(11) 98765-4321',
        cnh_number: '04589123477',
        cnh_category: 'E',
        cnh_expiration: '2028-06-15',
        status: 'EM_VIAGEM',
      },
      {
        name: 'Roberto Alves dos Santos',
        cpf: '78945612309',
        phone: '(11) 97654-3210',
        cnh_number: '05981234588',
        cnh_category: 'D',
        cnh_expiration: '2027-11-20',
        status: 'DISPONIVEL',
      },
      {
        name: 'Marcos Vinícius Pereira',
        cpf: '14725836900',
        phone: '(11) 96543-2109',
        cnh_number: '03216549811',
        cnh_category: 'C',
        cnh_expiration: '2029-02-10',
        status: 'DISPONIVEL',
      },
    ])
    .returning('*');

  // 4. Veículos
  const vehicles = await knex('vehicles')
    .insert([
      {
        plate: 'RNO1A23',
        model: 'FH 540',
        brand: 'Volvo',
        type: 'CARRETA',
        capacity_kg: 32000,
        status: 'EM_USO',
      },
      {
        plate: 'RNO4B56',
        model: 'Constellation 24.280',
        brand: 'Volkswagen',
        type: 'TRUCK',
        capacity_kg: 14000,
        status: 'DISPONIVEL',
      },
      {
        plate: 'RNO7C89',
        model: 'Accelo 1016',
        brand: 'Mercedes-Benz',
        type: 'VUC',
        capacity_kg: 5500,
        status: 'MANUTENCAO',
      },
    ])
    .returning('*');

  // 5. Pedidos
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const orders = await knex('orders')
    .insert([
      {
        order_code: 'RO-2026-1001',
        client_id: clients[0].id,
        driver_id: drivers[0].id,
        vehicle_id: vehicles[0].id,
        origin_address: 'Santana de Parnaíba - SP',
        destination_address: 'Curitiba - PR',
        cargo_description: 'Bobinas de aço galvanizado - Lote 42',
        cargo_weight_kg: 18500,
        freight_value: 4850.0,
        pickup_date: formatDate(yesterday),
        estimated_delivery_date: formatDate(tomorrow),
        status: 'EM_TRANSITO',
      },
      {
        order_code: 'RO-2026-1002',
        client_id: clients[1].id,
        driver_id: drivers[1].id,
        vehicle_id: vehicles[1].id,
        origin_address: 'Barueri - SP',
        destination_address: 'Ribeirão Preto - SP',
        cargo_description: 'Cargas secas paletizadas (22 pallets)',
        cargo_weight_kg: 9200,
        freight_value: 2600.0,
        pickup_date: formatDate(twoDaysAgo),
        estimated_delivery_date: formatDate(yesterday),
        delivered_at: yesterday.toISOString(),
        status: 'ENTREGUE',
      },
      {
        order_code: 'RO-2026-1003',
        client_id: clients[2].id,
        driver_id: null,
        vehicle_id: null,
        origin_address: 'Campinas - SP',
        destination_address: 'Belo Horizonte - MG',
        cargo_description: 'Estruturas metálicas pré-moldadas',
        cargo_weight_kg: 12000,
        freight_value: 3900.0,
        pickup_date: formatDate(twoDaysAgo),
        estimated_delivery_date: formatDate(yesterday), // Atrasado propositalmente para indicador do dashboard
        status: 'PENDENTE',
      },
    ])
    .returning('*');

  // 6. Histórico Inicial
  await knex('order_status_history').insert([
    {
      order_id: orders[0].id,
      previous_status: null,
      new_status: 'PENDENTE',
      notes: 'Pedido registrado no sistema.',
      changed_by: adminUser.id,
    },
    {
      order_id: orders[0].id,
      previous_status: 'PENDENTE',
      new_status: 'EM_TRANSITO',
      notes: 'Coleta concluída e veículo em rota pela BR-116.',
      changed_by: operatorUser.id,
    },
    {
      order_id: orders[1].id,
      previous_status: 'EM_TRANSITO',
      new_status: 'ENTREGUE',
      notes: 'Canhoto assinado pelo recebedor.',
      changed_by: operatorUser.id,
    },
    {
      order_id: orders[2].id,
      previous_status: null,
      new_status: 'PENDENTE',
      notes: 'Aguardando alocação de veículo disponível.',
      changed_by: adminUser.id,
    },
  ]);
}