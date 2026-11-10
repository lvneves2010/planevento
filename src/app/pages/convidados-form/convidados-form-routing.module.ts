import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConvidadosFormPage } from './convidados-form.page';

const routes: Routes = [
  {
    path: '',
    component: ConvidadosFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvidadosFormPageRoutingModule {}
