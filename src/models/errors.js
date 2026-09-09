const DETAIL_MAP = [
  ['credenciais inválidas', 'E-mail ou senha não conferem. Confira e tente de novo.'],
  ['conta desativada', 'Esta conta foi desativada. Fale com o AgroBench.'],
  ['token ausente', 'Sua sessão expirou. Entre de novo.'],
  ['token expirado', 'Sua sessão expirou. Entre de novo.'],
  ['token inválido', 'Sua sessão expirou. Entre de novo.'],
  ['refresh token', 'Sua sessão expirou. Entre de novo.'],
  ['código inválido', 'Esse código não conferiu. Peça outro e tente de novo.'],
  ['código expirado', 'O código expirou. Peça um novo.'],
  ['mfa_token', 'O código expirou. Entre de novo para receber outro.'],
  ['email ou CPF já cadastrado', 'Já existe uma conta com esse e-mail ou CPF.'],
  ['email ou CNPJ já cadastrado', 'Já existe uma conta com esse e-mail ou CNPJ.'],
  ['ciclo não está aberto', 'Esta safra não está recebendo envios agora.'],
  ['já existe contribuição ativa', 'Você já enviou dados nesta safra.'],
  ['CAR não aprovado', 'A fazenda ainda não foi confirmada. Volte ao cadastro da propriedade.'],
  ['CAR já vinculado', 'Esse cadastro da fazenda já está em uso.'],
  ['wallet já cadastrada', 'Sua conta no AgroBench já está pronta.'],
  ['wallet não encontrada', 'Ainda estamos preparando sua conta. Tente de novo em instantes.'],
  ['propriedade não encontrada', 'Cadastre sua fazenda para continuar.'],
  ['instituição ainda não aprovada', 'Sua instituição ainda aguarda liberação.'],
  ['instituição não encontrada', 'Não encontramos essa instituição.'],
  ['perfil insuficiente', 'Essa área não é para o seu tipo de conta.'],
  ['painel bloqueado', 'A comparação com a região libera depois de três safras confirmadas seguidas.'],
  ['ciclo já existe', 'Já existe uma safra com esse nome nesta região e cultura.'],
  ['closes_at deve ser depois', 'A data de encerramento precisa ser depois da abertura.'],
  ['CNPJ inválido', 'Confira o CNPJ e tente de novo.'],
  ['CPF inválido', 'Confira o CPF e tente de novo.'],
  ['plano regional exige', 'Escolha de 1 a 5 regiões para o acesso regional.'],
  ['falha ao enviar SMS', 'Não foi possível enviar o código agora. Tente de novo.'],
  ['falha ao consultar SICAR', 'Não foi possível confirmar a fazenda agora. Tente de novo.'],
  ['nenhum OTP pendente', 'Ainda não chegou um código. Espere alguns segundos e tente de novo.'],
  ['contribuição não está em committed', 'Este envio já passou da etapa de confirmação.'],
  ['destino inválido', 'Não foi possível registrar na sua conta. Tente de novo.'],
  ['falha ao travar stake', 'Não deu para travar os 10 dólares digitais. Tente de novo em instantes.'],
  ['saldo insuficiente', 'Não deu para travar os 10 dólares digitais — a conta ainda não tem esse valor.'],
]

export class FarmerError extends Error {
  constructor (message) {
    super(message)
    this.name = 'FarmerError'
  }
}

function humanFromText (text) {
  const raw = String(text || '')
  const lower = raw.toLowerCase()
  for (const [needle, message] of DETAIL_MAP) {
    if (lower.includes(needle.toLowerCase())) return message
  }
  if (/email: required|password: required/.test(lower)) return 'Preencha e-mail e senha.'
  if (/password: min/.test(lower)) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (/phone:/.test(lower)) return 'Use o telefone com DDD, no formato +55…'
  if (/code: len/.test(lower)) return 'O código tem 6 números.'
  return ''
}

export function asList (data) {
  return Array.isArray(data) ? data : []
}

export function isUnknownFieldError (err) {
  const detail = String(err.response?.data?.detail || err.message || '')
  return err.response?.status === 400 && /unknown field/i.test(detail)
}

export function apiError (err) {
  if (err instanceof FarmerError) return err.message

  const status = err.response?.status
  const data = err.response?.data

  if (status === 429) return 'Muitas tentativas. Espere um minuto e tente de novo.'
  if (err.code === 'ECONNABORTED') return 'A confirmação está demorando. Tente de novo em alguns segundos.'
  if (!err.response) {
    const msg = String(err.message || '')
    if (msg && !/network|timeout|failed/i.test(msg)) return msg
    return 'Não foi possível conectar agora. Tente de novo.'
  }

  if (data && typeof data === 'object') {
    const mapped = humanFromText(data.detail) || humanFromText(data.message)
    if (mapped) return mapped
  }

  if (status >= 500) return 'Não foi possível concluir agora. Tente de novo em instantes.'
  if (status === 404) return 'Não encontramos o que você procura.'
  if (status === 409) return 'Essa ação já foi feita ou conflita com um dado existente.'
  if (status === 403) return 'Você ainda não tem acesso a esta etapa.'
  if (status === 401) return 'E-mail ou senha não conferem. Confira e tente de novo.'

  return 'Não foi possível enviar agora. Tente de novo.'
}

export function apiErrorBody (err) {
  const data = err.response?.data
  return data && typeof data === 'object' ? data : {}
}

export function isNotFound (err) {
  return err.response?.status === 404
}
