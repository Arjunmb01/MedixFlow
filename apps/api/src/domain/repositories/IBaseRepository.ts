export interface IBaseRepository<T, CreateInput = unknown, UpdateInput = unknown> {
  findById(id: string): Promise<T | null>;
  findAll(params?: { skip?: number; take?: number; where?: unknown; orderBy?: unknown }): Promise<T[]>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: unknown): Promise<number>;
}
