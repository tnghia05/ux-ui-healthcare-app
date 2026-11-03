import {NavigationModule} from './booking/navigation.module.js';
import {AiChatModule} from './chat/ai-chat.module.js';
import { CallsModule } from './chat/calls.module.js';
import { PaymentsModule } from './booking/payments.module.js';
import { InsuranceModule } from './booking/insurance.module.js';
import { AccountModule } from './auth/account.module.js';
import { AftercareModule } from './booking/aftercare.module.js';
import { ChatModule } from './chat/chat.module.js';
import { CareModule } from './booking/care.module.js';
import { FamilyModule } from './booking/family.module.js';
import { HealthInfoModule } from './booking/health-info.module.js';
import { RecordsModule } from './booking/records.module.js';
import { LabModule } from './booking/lab.module.js';
import { BookingModule } from './booking/booking.module.js';
import { CheckinModule } from './booking/checkin.module.js';
import { BookingLifecycleModule } from './booking/lifecycle.module.js';
import { DiscoveryModule } from './discovery/discovery.module.js';
import { PasswordResetModule } from './auth/password-reset.js';
import { RegistrationModule } from './auth/registration.js';
import { AuthModule } from './auth/auth.module.js';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { readConfig } from './config.js';
import { HealthController } from './health.controller.js';

@Module({imports:[NavigationModule,AiChatModule,CallsModule,PaymentsModule,InsuranceModule,AccountModule,AftercareModule,ChatModule,CareModule,FamilyModule,HealthInfoModule,RecordsModule,LabModule,CheckinModule,BookingLifecycleModule,BookingModule,DiscoveryModule,PasswordResetModule,RegistrationModule,AuthModule,MongooseModule.forRootAsync({useFactory:()=>({uri:readConfig().uri,serverSelectionTimeoutMS:5000,retryAttempts:1})})],controllers:[HealthController]})
export class AppModule {}



