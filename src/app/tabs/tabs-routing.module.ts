import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [

      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.module').then(m => m.HomePageModule),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'cronograma',
        loadChildren: () =>
          import('../pages/cronograma/cronograma.module')
            .then(m => m.CronogramaPageModule)
      },
      {
        path: 'cronograma/novo',
        loadChildren: () =>
          import('../pages/cronograma-form/cronograma-form.module')
            .then(m => m.CronogramaFormPageModule)
      },
      {
        path: 'convidados',
        loadChildren: () =>
          import('../pages/convidados/convidados.module')
            .then(m => m.ConvidadosPageModule)
      },
      {
        path: 'evento',
        loadChildren: () =>
          import('../pages/evento/evento.module')
            .then(m => m.EventoPageModule)
      },
      {
        path: 'financeiro',
        loadChildren: () =>
          import('../pages/financeiro/financeiro.module')
            .then(m => m.FinanceiroPageModule)
      },
      {
        path: 'financeiro/categoria',
        loadChildren: () =>
          import('../pages/financeiro-categoria-form/financeiro-categoria-form.module')
            .then(m => m.FinanceiroCategoriaFormPageModule)
      },
      {
        path: 'financeiro/item',
        loadChildren: () =>
          import('../pages/financeiro-item-form/financeiro-item-form.module')
            .then(m => m.FinanceiroItemFormPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}