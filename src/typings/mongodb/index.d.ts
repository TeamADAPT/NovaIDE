declare module 'mongodb' {
    export class MongoClient {
        static connect(url: string): Promise<MongoClient>;
        db(name: string): Db;
        close(): Promise<void>;
    }

    export class Db {
        collection<T>(name: string): Collection<T>;
    }

    export class Collection<T> {
        createIndex(spec: any, options?: any): Promise<string>;
        insertOne(doc: T): Promise<any>;
        updateOne(filter: any, update: any, options?: any): Promise<any>;
        findOne(filter: any): Promise<T | null>;
        find(filter: any): Cursor<T>;
    }

    export class Cursor<T> {
        sort(spec: any): Cursor<T>;
        toArray(): Promise<T[]>;
    }
}