import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConvidadosPageRoutingModule } from './convidados-routing.module';

import { ConvidadosPage } from './convidados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConvidadosPageRoutingModule
  ],
  declarations: [ConvidadosPage]
})
export class ConvidadosPageModule {}
