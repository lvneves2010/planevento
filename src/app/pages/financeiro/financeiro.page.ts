import { Component, inject } from '@angular/core';
import { AlertController, IonSelect, ToastController } from '@ionic/angular';
import { EventosService } from '../../services/eventos.service';
import { FinanceiroService } from '../../services/financeiro.service';
import { EventoGet } from '../../models/evento-get.model';
import { FinanceiroCategoria } from '../../models/financeiro-categoria.model';
import { FinanceiroItem } from '../../models/financeiro-item.model';

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.scss'],
  standalone: false
})
export class FinanceiroPage {
  private eventosService = inject(EventosService);
  private financeiroService = inject(FinanceiroService);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  evento?: EventoGet;
  categorias: FinanceiroCategoria[] = [];
  itens: FinanceiroItem[] = [];
  carregando = false;

  private async exibirToast(mensagem: string, cor: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: cor,
      position: 'bottom'
    });
    await toast.present();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;

    this.eventosService.getEventoAtivo().subscribe({
      next: evento => {
        if (!evento) {
          this.carregando = false;
          return;
        }

        this.evento = evento;

        this.financeiroService
          .getCategoriasPorEvento(evento.id)
          .subscribe(c => (this.categorias = c));

        this.financeiroService
          .getItensPorEvento(evento.id)
          .subscribe(itens => {
            this.itens = itens;
            this.carregando = false;
          });
      },
      error: () => (this.carregando = false)
    });
  }

  deletarItem(id: string) {
    if (!this.evento) return;

    this.financeiroService.deletarItem(this.evento.id, id).subscribe(async () => {
      this.itens = this.itens.filter(i => i.id !== id);
      await this.exibirToast('Despesa removida.', 'success');
    });
  }

  statusColor(item: FinanceiroItem): string {
    return item.valorPago ? 'success' : 'medium';
  }

  statusTexto(item: FinanceiroItem): string {
    return item.valorPago ? 'Pago' : 'Pendente';
  }

  abrirSelectorStatus(select: IonSelect) {
    select.open();
  }

  alterarStatus(item: FinanceiroItem) {
    if (!this.evento) return;

    const novoValorPago = item.valorPago ? null : item.valorPrevisto;
    item.valorPago = novoValorPago;

    this.financeiroService
      .atualizarItem(this.evento.id, item.id, {
        categoriaId: item.categoriaId,
        descricao: item.descricao,
        valorPrevisto: item.valorPrevisto,
        valorPago: novoValorPago
      })
      .subscribe(async () => {
        await this.exibirToast('Despesa atualizada.', 'success');
      });
  }

  async editarItem(item: FinanceiroItem) {
    const alert = await this.alertController.create({
      header: 'Editar despesa',
      inputs: [
        {
          name: 'descricao',
          type: 'text',
          value: item.descricao,
          placeholder: 'Descricao'
        },
        {
          name: 'valorPrevisto',
          type: 'number',
          value: String(item.valorPrevisto || 0),
          placeholder: 'Valor previsto'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Proximo',
          handler: data => {
            const descricao = (data.descricao || '').trim();
            const valorPrevisto = Number(data.valorPrevisto) || 0;

            if (!descricao || valorPrevisto <= 0) {
              this.exibirToast(
                'Descricao e valor previsto sao obrigatorios.',
                'danger'
              );
              return false;
            }

            // Atualiza localmente
            item.descricao = descricao;
            item.valorPrevisto = valorPrevisto;

            // Vai para escolha de categoria
            this.editarCategoria(item);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async editarCategoria(item: FinanceiroItem) {
    if (!this.evento) {
      await this.exibirToast('Evento nao encontrado.', 'danger');
      return;
    }

    if (!this.categorias.length) {
      await this.exibirToast('Nenhuma categoria disponivel.', 'danger');
      return;
    }

    const inputs = this.categorias.map(categoria => ({
      type: 'radio' as const,
      label: categoria.nome,
      value: categoria.id,
      checked: categoria.id === item.categoriaId
    }));

    const alert = await this.alertController.create({
      header: 'Selecionar categoria',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: categoriaId => {
            item.categoriaId = categoriaId;

            this.financeiroService
              .atualizarItem(this.evento!.id, item.id, {
                categoriaId: item.categoriaId,
                descricao: item.descricao,
                valorPrevisto: item.valorPrevisto,
                valorPago: item.valorPago ?? null
              })
              .subscribe({
                next: async () => {
                  await this.exibirToast(
                    'Despesa editada com sucesso.',
                    'success'
                  );
                },
                error: async err => {
                  console.error('Erro ao editar despesa', err);
                  await this.exibirToast(
                    'Erro ao editar despesa.',
                    'danger'
                  );
                }
              });

            return true;
          }
        }
      ]
    });

    await alert.present();
  }
}
