import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConvidadosFormPageRoutingModule } from './convidados-form-routing.module';

import { ConvidadosFormPage } from './convidados-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConvidadosFormPageRoutingModule
  ],
  declarations: [ConvidadosFormPage]
})
export class ConvidadosFormPageModule {}
