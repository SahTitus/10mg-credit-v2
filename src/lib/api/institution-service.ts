import { BaseApiService } from './base-service';
import { Institution, InstitutionSettingsUpdate } from '@/types/institution';

export class InstitutionApiService extends BaseApiService {
  public async getAll(): Promise<Institution[]> {
    await this.delay(150);
    return this.store.getDatabase().institutions;
  }

  public async getById(id: string): Promise<Institution> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const inst = db.institutions.find((b) => b.id === id);
    if (!inst) {
      this.client.createNotFoundError(`Institution ${id}`);
    }
    return inst;
  }

  public async updateSettings(
    id: string,
    updates: InstitutionSettingsUpdate,
  ): Promise<Institution> {
    await this.delay(350);
    let updatedInstitution: Institution | undefined;

    this.store.updateDatabase((db) => {
      const idx = db.institutions.findIndex((b) => b.id === id);
      if (idx === -1) {
        this.client.createNotFoundError(`Institution ${id}`);
      }
      const existing = db.institutions[idx];
      const merged: Institution = {
        ...existing,
        ...updates,
      };
      db.institutions[idx] = merged;
      updatedInstitution = merged;
      return db;
    });

    if (!updatedInstitution) {
      this.client.createNotFoundError(`Institution ${id}`);
    }
    return updatedInstitution;
  }
}

export const institutionApiService = new InstitutionApiService();
