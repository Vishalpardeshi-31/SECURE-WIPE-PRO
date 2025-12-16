// Entity classes for local storage simulation
class BaseEntity {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static async list(filter = '') {
    const key = this.name.toLowerCase() + 's';
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    return items.filter(item =>
      !filter || Object.values(item).some(val =>
        val && val.toString().toLowerCase().includes(filter.toLowerCase())
      )
    );
  }

  static async create(data) {
    const key = this.name.toLowerCase() + 's';
    const items = await this.list();
    const newItem = new this({ ...data, id: Date.now().toString(), created_date: new Date().toISOString() });
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    return newItem;
  }

  static async get(id) {
    const items = await this.list();
    return items.find(item => item.id === id);
  }

  static async update(id, data) {
    const key = this.name.toLowerCase() + 's';
    const items = await this.list();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updated_date: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(items));
      return items[index];
    }
    return null;
  }

  static async delete(id) {
    const key = this.name.toLowerCase() + 's';
    const items = await this.list();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  }
}

export class Device extends BaseEntity {
  static name = 'Device';
}

export class WipeCertificate extends BaseEntity {
  static name = 'WipeCertificate';
}

export class UserWipeSession extends BaseEntity {
  static name = 'UserWipeSession';
}

export class User extends BaseEntity {
  static name = 'User';

  static async me() {
    // Mock current user
    return {
      id: '1',
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'user'
    };
  }
}

export class UserLogin extends BaseEntity {
  static name = 'UserLogin';
}

export class ConnectedDevice extends BaseEntity {
  static name = 'ConnectedDevice';
}
