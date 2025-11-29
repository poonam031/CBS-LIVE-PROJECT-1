import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-database',
  standalone: true,
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})

export class DatabaseComponent implements OnInit {
  databases = [
    { name: 'MySQL', img: 'assets/images/mysql.png' },
    { name: 'MsSQL', img: 'assets/images/mssql.png' },
    { name: 'PostgreSQL', img: 'assets/images/postgres.png' },
    { name: 'MariaDB', img: 'assets/images/mariadb2(2).png' },
    { name: 'MongoDB', img: 'assets/images/mongodb.png' },
    { name: 'Oracle', img: 'assets/images/oracle.png' },
  ];

  selectedPrimary: string | null = null;
  selectedClient: string | null = null;

  primaryClassMap: { [key: string]: string } = {};
  clientClassMap: { [key: string]: string } = {};

  primaryDatabaseName: string = '';
  clientDatabaseName: string = '';

  databaseForm!: FormGroup;

  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient) { }


  ngOnInit(): void {
    this.databaseForm = this.fb.group({
      type: ['', Validators.required],

      username: ['', Validators.required],

      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{1,8}$/)  // only numbers (1–8 digits)
        ]
      ],

      port: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/) // only digits allowed
        ]
      ],

      host: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(localhost|(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/ // IPv4 format )
          )
        ]
      ],

      database: ['', Validators.required]
    });
  }


  // ===== Select Primary Database =====
  selectPrimary(dbName: string) {
    this.selectedPrimary = dbName;                    // "MySQL", "PostgreSQL", etc.
    this.primaryClassMap = {};
    this.primaryClassMap[dbName] = 'ring-4 ring-green-400';
    this.primaryDatabaseName = dbName;               // display the engine name
  }


  // ===== Select Client Database =====
  selectClient(dbName: string) {
    this.selectedClient = dbName;
    this.clientClassMap = {};
    this.clientClassMap[dbName] = 'ring-4 ring-green-400';
    this.clientDatabaseName = dbName;

    // Map database names to TypeORM driver types
    const driverMap: { [key: string]: string } = {
      'PostgreSQL': 'postgres',
      'MySQL': 'mysql',
      'MsSQL': 'mssql',
      'MariaDB': 'mariadb',
      'MongoDB': 'mongodb',
      'Oracle': 'oracle'
    };

    this.databaseForm.patchValue({
      type: driverMap[dbName] || dbName.toLowerCase()
    });
  }



  onOkClick() {
    debugger
    if (this.databaseForm.invalid) {
      this.databaseForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
      return;
    }

    if (!this.selectedPrimary || !this.selectedClient) {
      alert('Please select both Primary and Client databases.');
      return;
    }

    const formData = this.databaseForm.value;
    const dbName = formData.database;
    const clientType = this.selectedClient;

    this.http.post('http://localhost:3000/database-mapping/connect', formData)
      .subscribe({
        next: (res: any) => {
          console.log('Backend connect response:', res);
          if (res.success) {
            alert(' ✅ Database connected successfully!');
            console.log('Form Data:', formData);
            console.log('Backend Response:', res.message);

            this.router.navigate(['/tables'], {
              queryParams: {
                primary: this.selectedPrimary,        // "PostgreSQL" or whatever primary engine
                primaryType: this.selectedPrimary,    // optional: same value
                client: dbName,                       // "ClientDb"
                clientType: clientType,               // "MySQL", "Postgres", etc.
              }

            });
          }
          else {
            alert(' Connection failed: ' + res.message);
          }
        },
        error: (err) => {
          console.error('Connection error:', err);
          alert(' Failed to connect to backend.');
        }
      });
  }


  // ===== Cancel Button =====
  onCancelClick() {
    this.databaseForm.reset();

    this.selectedPrimary = null;
    this.primaryClassMap = {};
    this.primaryDatabaseName = '';

    this.selectedClient = null;
    this.clientClassMap = {};
    this.clientDatabaseName = '';
  }
}
