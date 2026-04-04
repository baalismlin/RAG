export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class InMemoryUserRepository implements Repository<User> {
  private readonly store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.store.values());
  }

  async save(user: User): Promise<User> {
    this.store.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

export class UserService {
  private readonly repo: Repository<User>;

  constructor(repo: Repository<User>) {
    this.repo = repo;
  }

  async createUser(name: string, email: string): Promise<User> {
    const id = Math.random().toString(36).slice(2);
    const user: User = { id, name, email, createdAt: new Date() };
    return this.repo.save(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async listUsers(): Promise<User[]> {
    return this.repo.findAll();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    await this.repo.delete(id);
  }
}

export function formatUser(user: User): string {
  return `[${user.id}] ${user.name} <${user.email}>`;
}

export async function seedUsers(service: UserService): Promise<User[]> {
  const names = [
    { name: "Alice Smith", email: "alice@example.com" },
    { name: "Bob Jones", email: "bob@example.com" },
    { name: "Carol White", email: "carol@example.com" },
  ];
  return Promise.all(names.map((n) => service.createUser(n.name, n.email)));
}
