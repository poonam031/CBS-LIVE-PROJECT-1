import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../../service/app.service';

@Pipe({ name: 'filter', standalone: true })
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();

    return items.filter(item => {
      const value =
        typeof item === 'string'
          ? item
          : item.label ?? (item.name ?? item.id ?? '');
      return value?.toString().toLowerCase().includes(searchText);
    });
  }
}

@Component({
  selector: 'app-tables',
  standalone: true,
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
  imports: [CommonModule, FormsModule, FilterPipe],
})
export class TablesComponent implements OnInit {
  // Primary database tables
  dropdownItemsPrimary: any[] = [];
  selectedPrimaryTable: string[] = [];
  primaryDatabaseName = '';
  primaryTableSearch = '';

  // table -> column "rows" (each row = one column)
  primaryTableRowsByName: Record<string, any[]> = {};
  activePrimaryTable: string | null = null;

  // mapping per primary table
  mappingDataByTable: Record<string, any[]> = {};

  // Client database tables
  dropdownItemsClient: any[] = [];
  selectedClientTable: string[] = [];
  clientDatabaseName = '';
  clientTableSearch = '';
  actualClientDbName: string = '';
  clientTableRowsByName: Record<string, any[]> = {};
  activeClientTable: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['primary']) this.primaryDatabaseName = params['primary'];      // "PostgreSQL"
      if (params['clientType']) this.clientDatabaseName = params['clientType']; // "MySQL"
      if (params['client']) this.actualClientDbName = params['client'];         // "ClientDb"
    });
  }




  goToDatabase() {
    this.router.navigate(['/database']);
  }

  getAllTableNames() {
    this.appService.getPrimaryTableNames().subscribe((res: string[]) => {
      this.dropdownItemsPrimary = res || [];
    });

    this.appService.getClientTableNames().subscribe((res: string[]) => {
      this.dropdownItemsClient = res || [];
    });
  }

  // ===== PRIMARY SIDE =====

  onSelectPrimaryTable(tableName: string) {
    if (!this.selectedPrimaryTable.includes(tableName)) {
      this.selectedPrimaryTable.push(tableName);
    }

    // make this table the active one for the grid
    this.activePrimaryTable = tableName;

    // returns array of column names; convert each to a row object
    this.appService.getAllColumnsNames(tableName).subscribe((res: any) => {
      const rows = Array.isArray(res)
        ? res.map((colName: any, idx: number) => ({
          id: idx + 1,                             // row number for display
          name: typeof colName === 'string'
            ? colName                              // "id", "name", ...
            : colName?.column_name,
          position: '',
        }))
        : [];

      this.primaryTableRowsByName[tableName] = rows;
    });

  }


  setActivePrimaryTable(tableName: string) {
    this.activePrimaryTable = tableName;
  }

  get activePrimaryRows(): any[] {
    return this.activePrimaryTable
      ? this.primaryTableRowsByName[this.activePrimaryTable] || []
      : [];
  }

  getMappingRows(tableName: string): any[] {
    return this.mappingDataByTable[tableName] ?? [];
  }

  // ===== CLIENT SIDE =====

  onSelectClientTable(tableName: string) {
    if (!this.selectedClientTable.includes(tableName)) {
      this.selectedClientTable.push(tableName);
    }
    this.activeClientTable = tableName;

    this.appService.getAllColumnsNames(tableName).subscribe((res: any) => {
      const rows = Array.isArray(res)
        ? res.map((colName: any, idx: number) => ({
          id: idx + 1,
          name: typeof colName === 'string' ? colName : colName?.column_name,
        }))
        : [];

      this.clientTableRowsByName[tableName] = rows;
    });
  }

  setActiveClientTable(tableName: string) {
    this.activeClientTable = tableName;
  }

  get activeClientRows(): any[] {
    return this.activeClientTable
      ? this.clientTableRowsByName[this.activeClientTable] || []
      : [];
  }



  // ===== MAPPING =====

  onOkClick() {
    this.mappingDataByTable = {};

    this.selectedPrimaryTable.forEach(tableName => {
      const primaryRows = this.primaryTableRowsByName[tableName] || [];
      const mappings: any[] = [];

      primaryRows.forEach(primaryRow => {
        const enteredClientIndex = primaryRow.position;
        let clientMatch: any = null;

        if (enteredClientIndex && this.activeClientTable) {
          const clientRows =
            this.clientTableRowsByName[this.activeClientTable] || [];
          clientMatch = clientRows.find((_, i) => i + 1 == enteredClientIndex);
        }

        mappings.push({
          // shown under "Server Column"
          serverColumn: primaryRow.name,   // e.g. "id", "gender", "photo"

          // shown under "Client Column"
          clientColumn: clientMatch ? clientMatch.name || clientMatch.id : '-',

          // shown under "Client Display Name"
          clientDisplayName: clientMatch
            ? clientMatch.name || clientMatch.id || 'Unknown'
            : enteredClientIndex
              ? 'Not Found'
              : 'No Mapping',
        });
      });

      this.mappingDataByTable[tableName] = mappings;
    });
  }
}
