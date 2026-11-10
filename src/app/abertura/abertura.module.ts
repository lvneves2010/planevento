import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CompartilhadoModule } from '../compartilhado/compartilhado.module';
import { AberturaPage } from './abertura.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CompartilhadoModule,
    RouterModule.forChild([{ path: '', component: AberturaPage }])
  ],
  declarations: [AberturaPage]
})
export class AberturaPageModule {}
