export type UserRole = 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
}

export interface Client {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  zip_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  active: boolean;
}

export interface Driver {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  cnh_number: string;
  cnh_category: string;
  cnh_expiration: string;
  status: 'DISPONIVEL' | 'EM_VIAGEM' | 'INATIVO';
}

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  brand: string;
  type: 'VUC' | 'TOCO' | 'TRUCK' | 'CARRETA' | 'UTILITARIO';
  capacity_kg: number;
  status: 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO' | 'INATIVO';
}

export interface Order {
  id: number;
  order_code: string;
  client_id: number;
  client_name?: string;
  client_document?: string;
  driver_id?: number | null;
  driver_name?: string | null;
  vehicle_id?: number | null;
  vehicle_plate?: string | null;
  origin_address: string;
  destination_address: string;
  cargo_description: string;
  cargo_weight_kg: number;
  freight_value: number;
  pickup_date: string;
  estimated_delivery_date: string;
  delivered_at?: string | null;
  status: 'PENDENTE' | 'EM_COLETA' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADO';
  created_at?: string;
  history?: OrderHistory[];
}

export interface OrderHistory {
  id: number;
  order_id: number;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  user_name?: string;
  created_at: string;
}

export interface DashboardMetrics {
  ongoingOrders: number;
  completedOrders: number;
  delayedOrders: number;
  totalClients: number;
  totalDrivers: number;
  totalVehicles: number;
}