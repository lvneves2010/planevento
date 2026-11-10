import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventoGet } from '../models/evento-get.model';
import { ArmazenamentoService } from './armazenamento.service';
import { paraIsoOuUndefined } from './datas';

interface EventoSalvo extends EventoGet {
  criadoEm: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private armazenamento = inject(ArmazenamentoService);

  private static readonly COLECAO = 'eventos';

  /**
   * Retorna o primeiro evento cadastrado (o "evento ativo").
   */
  getEventoAtivo(): Observable<EventoGet | null> {
    return from(this.armazenamento.listar<EventoSalvo>(EventosService.COLECAO)).pipe(
      map(eventos => {
        if (!eventos.length) {
          return null;
        }
        const { id, nome, dataEvento, local, observacoes } = eventos[0];
        return { id, nome, dataEvento, local, observacoes };
      })
    );
  }

  criarEvento(payload: Partial<EventoGet>): Observable<void> {
    return from(
      this.armazenamento.inserir<EventoSalvo>(EventosService.COLECAO, {
        nome: payload.nome || '',
        dataEvento: paraIsoOuUndefined(payload.dataEvento),
        local: payload.local || undefined,
        observacoes: payload.observacoes || undefined,
        criadoEm: new Date().toISOString()
      })
    ).pipe(map(() => void 0));
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
}
