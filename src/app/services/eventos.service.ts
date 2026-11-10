import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventoGet } from '../models/evento-get.model';
import { ArmazenamentoService } from './armazenamento.service';
import { paraIsoOuUndefined } from './datas';

interface EventoSalvo extends EventoGet {
  criadoEm: string;
}

/**
 * Eventos cadastrados no aparelho. Pode haver vários; o "evento ativo" é o
 * que foi selecionado no dashboard, e é ele que as abas Cronograma,
 * Convidados, Financeiro e Evento usam. Os dados de cada evento ficam em
 * coleções próprias (`eventos/<id>/...`).
 */
@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private armazenamento = inject(ArmazenamentoService);

  private static readonly COLECAO = 'eventos';
  private static readonly CHAVE_SELECIONADO = 'eventoSelecionado';
  private static readonly SUBCOLECOES = ['convidados', 'tarefas', 'categoriasFinanceiras', 'itensFinanceiros'];

  /** Todos os eventos, ordenados pela data (os sem data vão para o fim). */
  listarEventos(): Observable<EventoGet[]> {
    return from(this.listarOrdenados());
  }

  /**
   * Retorna o evento selecionado. Se nenhum foi selecionado (ou ele foi
   * excluído), cai no primeiro da lista, como era antes de haver vários.
   */
  getEventoAtivo(): Observable<EventoGet | null> {
    return from(this.buscarAtivo());
  }

  selecionarEvento(id: string): Observable<void> {
    return from(this.armazenamento.gravarValor(EventosService.CHAVE_SELECIONADO, id));
  }

  /** Cria o evento, já o deixa selecionado e devolve o id. */
  criarEvento(payload: Partial<EventoGet>): Observable<string> {
    return from(
      (async () => {
        const novo = await this.armazenamento.inserir<EventoSalvo>(EventosService.COLECAO, {
          nome: payload.nome || '',
          dataEvento: paraIsoOuUndefined(payload.dataEvento),
          local: payload.local || undefined,
          observacoes: payload.observacoes || undefined,
          criadoEm: new Date().toISOString()
        });
        await this.armazenamento.gravarValor(EventosService.CHAVE_SELECIONADO, novo.id);
        return novo.id;
      })()
    );
  }

  atualizarEvento(id: string, payload: Partial<EventoGet>): Observable<void> {
    return from(
      this.armazenamento.atualizar<EventoSalvo>(EventosService.COLECAO, id, {
        nome: payload.nome || '',
        dataEvento: paraIsoOuUndefined(payload.dataEvento),
        local: payload.local || undefined,
        observacoes: payload.observacoes || undefined
      })
    );
  }

  /** Exclui o evento e tudo o que é dele (convidados, tarefas, financeiro). */
  excluirEvento(id: string): Observable<void> {
    return from(
      (async () => {
        await this.armazenamento.remover<EventoSalvo>(EventosService.COLECAO, id);
        for (const sub of EventosService.SUBCOLECOES) {
          await this.armazenamento.removerColecao(`${EventosService.COLECAO}/${id}/${sub}`);
        }
        const selecionado = await this.armazenamento.lerValor(EventosService.CHAVE_SELECIONADO);
        if (selecionado === id) {
          await this.armazenamento.gravarValor(EventosService.CHAVE_SELECIONADO, null);
        }
      })()
    );
  }

  private async buscarAtivo(): Promise<EventoGet | null> {
    const [eventos, selecionado] = await Promise.all([
      this.armazenamento.listar<EventoSalvo>(EventosService.COLECAO),
      this.armazenamento.lerValor(EventosService.CHAVE_SELECIONADO)
    ]);
    const evento = eventos.find(e => e.id === selecionado) ?? eventos[0];
    return evento ? this.paraEventoGet(evento) : null;
  }

  private async listarOrdenados(): Promise<EventoGet[]> {
    const eventos = await this.armazenamento.listar<EventoSalvo>(EventosService.COLECAO);
    return eventos
      .map(e => this.paraEventoGet(e))
      .sort((a, b) => {
        if (!a.dataEvento) return b.dataEvento ? 1 : 0;
        if (!b.dataEvento) return -1;
        return a.dataEvento.localeCompare(b.dataEvento);
      });
  }

  private paraEventoGet({ id, nome, dataEvento, local, observacoes }: EventoSalvo): EventoGet {
    return { id, nome, dataEvento, local, observacoes };
  }
}
