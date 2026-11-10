export enum StatusTarefa {
  Pendente = 'Pendente',
  EmAndamento = 'EmAndamento',
  Concluida = 'Concluida'
}

export interface TarefaGet {
  id: string;
  descricao: string;
  dataLimite: string;
  status: StatusTarefa;
}