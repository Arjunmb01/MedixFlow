import { prisma } from "../../infrastructure/database/prismaClient";

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract model: any;

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id }
    });
  }

  async findAll(params: { skip?: number; take?: number; where?: any; orderBy?: any } = {}): Promise<T[]> {
    return this.model.findMany(params);
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id }
    });
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({ where });
  }
}
