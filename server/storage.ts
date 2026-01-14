// Minimal storage implementation required by template
// This project does not currently use user storage. Keep a small shim so
// server code that imports `storage` compiles both for local and Vercel builds.

export interface IStorage {
  // intentionally generic to avoid tight coupling
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(_id: string): Promise<any | undefined> {
    return undefined;
  }

  async getUserByUsername(_username: string): Promise<any | undefined> {
    return undefined;
  }

  async createUser(_user: any): Promise<any> {
    throw new Error("Not implemented");
  }
}

export const storage = new DatabaseStorage();
