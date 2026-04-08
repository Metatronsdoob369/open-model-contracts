import { z } from 'zod';
export declare const TaskSchema: any;
export type Task = z.infer<typeof TaskSchema>;
export declare const CreateTaskRequestSchema: any;
export declare const UpdateTaskRequestSchema: any;
export declare const TaskListResponseSchema: any;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
