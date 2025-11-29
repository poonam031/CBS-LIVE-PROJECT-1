import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  http = inject(HttpClient)
  BASE_URL = 'http://localhost:3000/'

  constructor() { }


  getAllTableNames() {
    return this.http.get(this.BASE_URL + 'database-mapping/getAllTableName')
  }
  getAllColumnsNames(tableName: string) {
    return this.http.post(this.BASE_URL + 'database-mapping/getAllColumnsNames', { tableName });
  }

  getPrimaryTableNames() {
    return this.http.get<string[]>(
      this.BASE_URL + 'database-mapping/primary-tables'
    );
  }

  getClientTableNames() {
    return this.http.get<string[]>(
      this.BASE_URL + 'database-mapping/client-tables'
    );
  }
  //new addition1
  getTableStructure(tableName: string) {
    return this.http.post<{ columns: string[]; rows: any[] }>(
      this.BASE_URL + 'database-mapping/getTableStructure',
      { tableName }
    );
  }



}
