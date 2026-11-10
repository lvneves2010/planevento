import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'abertura',
    pathMatch: 'full'
  },
  {
    path: 'abertura',
    loadChildren: () =>
      import('./abertura/abertura.module').then(m => m.AberturaPageModule)
  },
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'convidados-form',
    loadChildren: () => import('./pages/convidados-form/convidados-form.module').then( m => m.ConvidadosFormPageModule)
  },
  {
    path: 'financeiro',
    loadChildren: () => import('./pages/financeiro/financeiro.module').then( m => m.FinanceiroPageModule)
  },
  {
    path: 'financeiro-categoria-form',
    loadChildren: () => import('./pages/financeiro-categoria-form/financeiro-categoria-form.module').then( m => m.FinanceiroCategoriaFormPageModule)
  },
  {
    path: 'financeiro-item-form',
    loadChildren: () => import('./pages/financeiro-item-form/financeiro-item-form.module').then( m => m.FinanceiroItemFormPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}