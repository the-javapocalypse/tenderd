import type {
  Model,
  Document,
  PaginateOptions,
  PaginateResult,
  PaginateModel,
} from "mongoose";
import { ApiError } from "./exception-handler.service";
import { StatusCodes } from "http-status-codes";
import type RedisCacheService from "./redis-cache.service";

type CrudServiceParams<T> = {
  model: Model<T> & PaginateModel<T>;
  module: string;
  redisCacheService: RedisCacheService;
  getResponse: (document: T) => any;
};

export class CrudService<T extends Document> {
  protected readonly redisCacheService: RedisCacheService;
  protected readonly moduleName: string;
  protected readonly getReturnValues: (document: T) => any;
  protected readonly model: Model<T> & PaginateModel<T>;

  constructor(params: CrudServiceParams<T>) {
    this.model = params.model;
    this.redisCacheService = params.redisCacheService;
    this.moduleName = params.module;
    this.getReturnValues = params.getResponse;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    const createdDocument = await document.save();
    await this.redisCacheService.removeModule(this.moduleName);
    return this.getReturnValues(createdDocument);
  }

  async getById(id: string): Promise<T> {
    const document = (await this.model.findById(id).lean()) as T;
    if (!document) {
      throw new ApiError("Record not found", StatusCodes.NOT_FOUND);
    }
    return this.getReturnValues(document);
  }

  async list(
    page: number = 1,
    limit: number = 10,
    query: any = {}
  ): Promise<PaginateResult<T>> {
    const cacheKey = `${this.moduleName}-${page}-${limit}-${JSON.stringify(query)}`;
    const cachedData = await this.redisCacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const options: PaginateOptions = {
      page,
      limit,
      lean: true,
    };
    const documents = await this.model.paginate(query, options);
    documents.docs = documents.docs.map((doc) => this.getReturnValues(doc));
    await this.redisCacheService.set(cacheKey, documents);
    return documents;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const document = await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    if (!document) {
      throw new ApiError("Record not found", StatusCodes.NOT_FOUND);
    }

    await this.redisCacheService.removeModule(this.moduleName);
    return this.getReturnValues(document);
  }

  // using hard delete for demo purposes
  async delete(id: string): Promise<T> {
    const document = await this.model.findByIdAndDelete(id);
    if (!document) {
      throw new ApiError("Record not found", StatusCodes.NOT_FOUND);
    }
    await this.redisCacheService.removeModule(this.moduleName);
    return this.getReturnValues(document);
  }
}
