const PAID = 1
const CONFIRMED = 2
const PENDING = 3
const CANCELLED = 4

function makeTransactionId(prefix = 'PAY') {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function simulatePayment(amount, options = {}) {
  const delayMs = Math.max(0, options.delayMs ?? 25)
  const randomFn = options.randomFn ?? Math.random

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  const random = randomFn()

  let status = 0
  if (random > 0.4) status = PAID
  else if (random > 0.3) status = CONFIRMED
  else if (random > 0.15) status = PENDING
  else status = CANCELLED

  switch (status) {
    case PAID:
      return {
        success: true,
        status: 'PAID',
        transactionId: makeTransactionId(),
        message: 'Pago aprobado',
        amount,
      }
    case CONFIRMED:
      return {
        success: true,
        status: 'CONFIRMED',
        transactionId: makeTransactionId(),
        message: 'Pago confirmado',
        amount,
      }
    case PENDING:
      return {
        success: false,
        status: 'PENDING',
        transactionId: makeTransactionId('PAY-REV'),
        message: 'Pago en revision por el banco',
        amount,
      }
    case CANCELLED:
      return {
        success: false,
        status: 'CANCELLED',
        message: 'Fondos insuficientes o tarjeta rechazada',
        amount,
      }
    default:
      return {
        success: false,
        status: 'ERROR',
        message: 'Error desconocido en el proceso de pago',
        amount,
      }
  }
}
