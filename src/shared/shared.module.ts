import { Module } from '@nestjs/common';
import SharedService from './shared.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [],
  exports: [SharedService],
  imports: [CacheModule.register()],
  providers: [SharedService],
})
export class SharedModule {}
