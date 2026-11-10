import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinanceiroItemFormPage } from './financeiro-item-form.page';

const routes: Routes = [
  {
    path: '',
    component: FinanceiroItemFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceiroItemFormPageRoutingModule {}
