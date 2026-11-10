import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinanceiroCategoriaFormPage } from './financeiro-categoria-form.page';

const routes: Routes = [
  {
    path: '',
    component: FinanceiroCategoriaFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroCategoriaFormPageRoutingModule {}
