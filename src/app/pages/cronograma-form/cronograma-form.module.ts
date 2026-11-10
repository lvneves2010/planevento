import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CronogramaFormPageRoutingModule } from './cronograma-form-routing.module';

import { CronogramaFormPage } from './cronograma-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CronogramaFormPageRoutingModule
  ],
  declarations: [CronogramaFormPage]
})
export class CronogramaFormPageModule {}
