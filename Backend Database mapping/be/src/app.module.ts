import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { DatabaseMappingModule } from './database-mapping/database-mapping.module';
import { primaryDBConfig } from './orm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(primaryDBConfig),
    // TypeOrmModule.forRoot(clientDBConfig),
    DatabaseModule,
    DatabaseMappingModule,
    // clientDBConfig
  ],
})
export class AppModule { }
