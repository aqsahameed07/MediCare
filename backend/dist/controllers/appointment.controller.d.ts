import type { Request, Response } from "express";
export declare function getAppointmentDoctors(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getAppointmentAvailability(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateAppointmentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=appointment.controller.d.ts.map