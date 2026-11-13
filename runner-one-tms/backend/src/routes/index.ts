import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { DashboardController } from '../controllers/dashboard.controller';
import { ClientController } from '../controllers/client.controller';
import { DriverController } from '../controllers/driver.controller';
import { VehicleController } from '../controllers/vehicle.controller';
import { OrderController } from '../controllers/order.controller';
import { ReportController } from '../controllers/report.controller';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Rotas Públicas de Autenticação
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);

// Rotas Protegidas por Autenticação
router.use(authMiddleware);

// Perfil do Usuário Logado
router.get('/users/profile', UserController.getProfile);
router.put('/users/profile', UserController.updateProfile);

// Dashboard
router.get('/dashboard', DashboardController.getMetrics);

// Clientes
router.get('/clients', ClientController.list);
router.get('/clients/:id', ClientController.getById);
router.post('/clients', ClientController.create);
router.put('/clients/:id', ClientController.update);
router.delete('/clients/:id', requireRole(['ADMIN']), ClientController.remove);

// Motoristas
router.get('/drivers', DriverController.list);
router.get('/drivers/:id', DriverController.getById);
router.post('/drivers', DriverController.create);
router.put('/drivers/:id', DriverController.update);
router.delete('/drivers/:id', requireRole(['ADMIN']), DriverController.remove);

// Veículos
router.get('/vehicles', VehicleController.list);
router.get('/vehicles/:id', VehicleController.getById);
router.post('/vehicles', VehicleController.create);
router.put('/vehicles/:id', VehicleController.update);
router.delete('/vehicles/:id', requireRole(['ADMIN']), VehicleController.remove);

// Pedidos de Transporte
router.get('/orders', OrderController.list);
router.get('/orders/:id', OrderController.getById);
router.post('/orders', OrderController.create);
router.put('/orders/:id', OrderController.update);
router.patch('/orders/:id/status', OrderController.updateStatus);

// Relatórios
router.get('/reports', ReportController.getReport);

export default router;