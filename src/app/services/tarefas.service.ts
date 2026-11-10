import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TarefaGet, StatusTarefa } from '../models/tarefa-get.model';
import { ArmazenamentoService } from './armazenamento.service';
import { paraIsoOuUndefined } from './datas';

interface TarefaSalva extends TarefaGet {
  criadoEm?: string;
}

const STATUS_VALIDOS = Object.values(StatusTarefa);

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private armazenamento = inject(ArmazenamentoService);

  private colecao(eventoId: string): string {
    return `eventos/${eventoId}/tarefas`;
  }

  getTarefasPorEvento(eventoId: string): Observable<TarefaGet[]> {
    return from(this.armazenamento.listar<TarefaSalva>(this.colecao(eventoId))).pipe(
      map(tarefas =>
        tarefas.map(t => ({
          id: t.id,
          descricao: t.descricao,
          dataLimite: t.dataLimite || '',
          status: STATUS_VALIDOS.includes(t.status) ? t.status : StatusTarefa.Pendente
        }))
      )
    );
  }

  criarTarefa(eventoId: string, payload: Partial<TarefaGet>): Observable<void> {
    return from(
      this.armazenamento.inserir<TarefaSalva>(this.colecao(eventoId), {
        descricao: payload.descricao || '',
        dataLimite: paraIsoOuUndefined(payload.dataLimite) || '',
        status: StatusTarefa.Pendente,
        criadoEm: new Date().toISOString()
      })
    ).pipe(map(() => void 0));
  }

  atualizarTarefa(eventoId: string, tarefaId: string, payload: Partial<TarefaGet>): Observable<void> {
    const statusSeguro = payload.status && STATUS_VALIDOS.includes(payload.status)
      ? payload.status
      : StatusTarefa.Pendente;

    return from(
      this.armazenamento.atualizar<TarefaSalva>(this.colecao(eventoId), tarefaId, {
        descricao: payload.descricao,
        dataLimite: paraIsoOuUndefined(payload.dataLimite) || '',
        status: statusSeguro
      })
    );
  }

  deletarTarefa(eventoId: string, tarefaId: string): Observable<void> {
    return from(this.armazenamento.remover<TarefaSalva>(this.colecao(eventoId), tarefaId));
  }
}
