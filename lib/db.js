import { MongoClient } from "mongodb";
let connection;
export async function database() {
  if (!process.env.MONGODB_URI) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!connection)
    connection = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    })
      .connect()
      .catch((e) => {
        connection = undefined;
        throw e;
      });
  return (await connection).db(process.env.MONGODB_DB || "inci_lens");
}
