import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinanceiroItemFormPageRoutingModule } from './financeiro-item-form-routing.module';

import { FinanceiroItemFormPage } from './financeiro-item-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinanceiroItemFormPageRoutingModule
  ],
  declarations: [FinanceiroItemFormPage]
})
export class FinanceiroItemFormPageModule {}
