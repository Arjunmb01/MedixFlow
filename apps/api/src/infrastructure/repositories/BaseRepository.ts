import { IBaseRepository } from "../../domain/repositories/IBaseRepository";

export abstract class BaseRepository<T, CreateInput, UpdateInput> implements IBaseRepository<T, CreateInput, UpdateInput> {
  protected abstract model: any;

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id }
    });
  }

  async findAll(params: { skip?: number; take?: number; where?: unknown; orderBy?: unknown } = {}): Promise<T[]> {
    return (this.model as any).findMany(params);
  }

  async create(data: CreateInput): Promise<T> {
    return (this.model as any).create({ data });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return (this.model as any).update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<T> {
    return (this.model as any).delete({
      where: { id }
    });
  }

  async count(where: unknown = {}): Promise<number> {
    return (this.model as any).count({ where });
  }
}
