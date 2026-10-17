import { type Model, model, models, type Schema } from "mongoose";

/**
 * Registers a Mongoose model once per name (safe with Next.js hot reload).
 */
export function registerModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema);
}
