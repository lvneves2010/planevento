import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinanceiroCategoriaFormPageRoutingModule } from './financeiro-categoria-form-routing.module';

import { FinanceiroCategoriaFormPage } from './financeiro-categoria-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinanceiroCategoriaFormPageRoutingModule
  ],
  declarations: [FinanceiroCategoriaFormPage]
})
export class FinanceiroCategoriaFormPageModule {}
