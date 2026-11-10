import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConvidadosPage } from './convidados.page';

const routes: Routes = [
  {
    path: '',
    component: ConvidadosPage
  },
  {
    path: 'novo',
    loadChildren: () =>
      import('../convidados-form/convidados-form.module')
        .then(m => m.ConvidadosFormPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvidadosPageRoutingModule {}
