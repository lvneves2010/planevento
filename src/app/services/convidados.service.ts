import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConvidadoGet } from '../models/convidado-get.model';
import { ArmazenamentoService } from './armazenamento.service';

interface ConvidadoSalvo extends ConvidadoGet {
  criadoEm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConvidadosService {
  private armazenamento = inject(ArmazenamentoService);

  private colecao(eventoId: string): string {
    return `eventos/${eventoId}/convidados`;
  }

  getConvidadosPorEvento(eventoId: string): Observable<ConvidadoGet[]> {
    return from(this.armazenamento.listar<ConvidadoSalvo>(this.colecao(eventoId))).pipe(
      map(convidados =>
        convidados.map(c => ({
          id: c.id,
          nome: c.nome,
          email: c.email,
          confirmacaoPresenca: c.confirmacaoPresenca ?? null,
          quantidadeAcompanhantes: c.quantidadeAcompanhantes ?? 0,
          observacoes: c.observacoes
        }))
      )
    );
  }

  criarConvidado(eventoId: string, payload: Partial<ConvidadoGet>): Observable<void> {
    return from(
      this.armazenamento.inserir<ConvidadoSalvo>(this.colecao(eventoId), {
        nome: payload.nome || '',
        email: payload.email || undefined,
        confirmacaoPresenca: payload.confirmacaoPresenca ?? null,
        quantidadeAcompanhantes: payload.quantidadeAcompanhantes || 0,
        observacoes: payload.observacoes || undefined,
        criadoEm: new Date().toISOString()
      })
    ).pipe(map(() => void 0));
  }

  atualizarConvidado(eventoId: string, convidadoId: string, payload: Partial<ConvidadoGet>): Observable<void> {
    return from(
      this.armazenamento.atualizar<ConvidadoSalvo>(this.colecao(eventoId), convidadoId, {
        nome: payload.nome,
        email: payload.email || undefined,
        confirmacaoPresenca: payload.confirmacaoPresenca ?? null,
        quantidadeAcompanhantes: payload.quantidadeAcompanhantes || 0,
        observacoes: payload.observacoes || undefined
      })
    );
  }

  deletarConvidado(eventoId: string, convidadoId: string): Observable<void> {
    return from(this.armazenamento.remover<ConvidadoSalvo>(this.colecao(eventoId), convidadoId));
  }
}
