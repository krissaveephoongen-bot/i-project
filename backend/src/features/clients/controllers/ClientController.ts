/**
 * Client Controller - Handles HTTP requests for client endpoints
 */

import { Request, Response, NextFunction } from "express";
import { ClientService } from "../services/ClientService";
import {
  ApiResponse,
  PaginatedResponse,
} from "../../../shared/types/ApiResponse";
import { ClientFilters, ClientPagination } from "../types/clientTypes";

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  /**
   * GET /api/clients - List all clients with filtering and pagination
   */
  getClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "asc",
        search,
        taxId,
      } = req.query;

      const filters: ClientFilters = {
        search: search as string,
        taxId: taxId as string,
      };

      const pagination: ClientPagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.clientService.getClients(filters, pagination);

      const response: PaginatedResponse<any> = {
        success: true,
        message: "Clients retrieved successfully",
        data: result.clients,
        pagination: result.pagination,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/clients/:id - Get client by ID
   */
  getClientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const client = await this.clientService.getClientById(id);

      const response: ApiResponse = {
        success: true,
        message: "Client retrieved successfully",
        data: client,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/clients - Create new client
   */
  createClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientData = req.body;
      const client = await this.clientService.createClient(clientData);

      const response: ApiResponse = {
        success: true,
        message: "Client created successfully",
        data: client,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/clients/:id - Update client
   */
  updateClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const client = await this.clientService.updateClient(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: "Client updated successfully",
        data: client,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/clients/:id - Delete client
   */
  deleteClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.clientService.deleteClient(id);

      const response: ApiResponse = {
        success: true,
        message: "Client deleted successfully",
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/clients/search/:query - Search clients
   */
  searchClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.params;
      const { limit = 10 } = req.query;

      const results = await this.clientService.searchClients(
        query,
        parseInt(limit as string),
      );

      const response: ApiResponse = {
        success: true,
        message: "Clients search results",
        data: results,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/clients/count/total - Get total clients count
   */
  getClientsCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.clientService.getClientsCount();

      const response: ApiResponse = {
        success: true,
        message: "Clients count retrieved successfully",
        data: { count },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
