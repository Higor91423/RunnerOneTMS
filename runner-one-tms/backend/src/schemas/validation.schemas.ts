import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'OPERADOR', 'VISUALIZADOR']).optional().default('OPERADOR'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
});

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome ou Razão Social obrigatório'),
  document: z.string().min(11, 'CPF ou CNPJ inválido').max(20),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(8, 'Telefone obrigatório'),
  zip_code: z.string().min(8, 'CEP obrigatório'),
  street: z.string().min(2, 'Logradouro obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado (UF) deve ter 2 letras'),
  active: z.boolean().optional().default(true),
});

export const driverSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  phone: z.string().min(8, 'Telefone obrigatório'),
  cnh_number: z.string().min(9, 'Número da CNH obrigatório'),
  cnh_category: z.string().min(1, 'Categoria da CNH obrigatória'),
  cnh_expiration: z.string().min(10, 'Data de validade da CNH obrigatória'),
  status: z.enum(['DISPONIVEL', 'EM_VIAGEM', 'INATIVO']).optional().default('DISPONIVEL'),
});

export const vehicleSchema = z.object({
  plate: z.string().min(7, 'Placa obrigatória').max(10),
  model: z.string().min(2, 'Modelo obrigatório'),
  brand: z.string().min(2, 'Marca obrigatória'),
  type: z.enum(['VUC', 'TOCO', 'TRUCK', 'CARRETA', 'UTILITARIO']),
  capacity_kg: z.coerce.number().positive('Capacidade deve ser maior que zero'),
  status: z.enum(['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'INATIVO']).optional().default('DISPONIVEL'),
});

export const orderSchema = z.object({
  client_id: z.coerce.number().positive('Cliente obrigatório'),
  driver_id: z.coerce.number().positive().nullable().optional(),
  vehicle_id: z.coerce.number().positive().nullable().optional(),
  origin_address: z.string().min(5, 'Endereço de origem obrigatório'),
  destination_address: z.string().min(5, 'Endereço de destino obrigatório'),
  cargo_description: z.string().min(3, 'Descrição da carga obrigatória'),
  cargo_weight_kg: z.coerce.number().positive('Peso da carga deve ser positivo'),
  freight_value: z.coerce.number().min(0, 'Valor do frete não pode ser negativo'),
  pickup_date: z.string().min(10, 'Data de coleta obrigatória'),
  estimated_delivery_date: z.string().min(10, 'Data estimada de entrega obrigatória'),
  status: z.enum(['PENDENTE', 'EM_COLETA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO']).optional().default('PENDENTE'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'EM_COLETA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO']),
  notes: z.string().optional(),
});