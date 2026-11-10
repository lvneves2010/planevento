export interface ConvidadoGet {
  id: string;
  nome: string;
  email?: string;
  confirmacaoPresenca: boolean | null;
  quantidadeAcompanhantes?: number;
  observacoes?: string;
}