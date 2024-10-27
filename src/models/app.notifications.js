const NOTIFICATION_TYPES = {
  // Notificações para Itens Salvos
  ITEM_SAVED: {
    message: "Item salvo com sucesso.",
    type: "info",
  },
  ITEM_ALREADY_SAVED: {
    message: "Este item já foi salvo.",
    type: "warning",
  },
  ITEM_NOT_FOUND: {
    message: "O item solicitado não foi encontrado.",
    type: "alert",
  },
  NOTIFICATION_RECEIVED: {
    message: "Você recebeu uma nova notificação.",
    type: "info",
  },
  CONNECTION_REQUEST_RECEIVED: {
    message: "Você recebeu uma solicitação de conexão.",
    type: "info",
  },
  CONNECTION_REQUEST_ACCEPTED: {
    message: "Sua solicitação de conexão foi aceita.",
    type: "info",
  },
  CONNECTION_REQUEST_REJECTED: {
    message: "Sua solicitação de conexão foi rejeitada.",
    type: "warning",
  },
  JOB_APPLIED: {
    message: "Você se inscreveu na vaga com sucesso.",
    type: "info",
  },
  JOB_APPLICATION_REJECTED: {
    message: "Sua candidatura à vaga foi rejeitada.",
    type: "alert",
  },

  // Notificações para Desafios
  CHALLENGE_CREATED: {
    message: "Um novo desafio foi criado.",
    type: "info",
  },
  CHALLENGE_COMPLETED: {
    message: "Você completou o desafio com sucesso!",
    type: "info",
  },
  CHALLENGE_FAILED: {
    message: "Você não completou o desafio.",
    type: "alert",
  },
  CHALLENGE_PARTICIPATION: {
    message: "Você participou de um desafio.",
    type: "info",
  },
  CHALLENGE_REVIEWED: {
    message: "Seu desafio foi revisado.",
    type: "info",
  },

  // Notificações para Publicações
  POST_CREATED: {
    message: "Uma nova publicação foi criada.",
    type: "info",
  },
  POST_LIKED: {
    message: "Seu post foi curtido.",
    type: "info",
  },
  POST_COMMENTED: {
    message: "Alguém comentou no seu post.",
    type: "info",
  },
  POST_SHARED: {
    message: "Seu post foi compartilhado.",
    type: "info",
  },
  POST_REMOVED: {
    message: "Sua publicação foi removida.",
    type: "alert",
  },

  // Notificações Campus/Instituição
  SCHOOL_POSTED_NEW_CONTENT: {
    message: "Sua instituição publicou algo novo no campus.",
    type: "info",
  },
  SCHOOL_ALERT_ISSUED: {
    message: "Sua instituição emitiu um alerta.",
    type: "alert",
  },
  SCHOOL_EVENT_SCHEDULED: {
    message: "Um novo evento foi agendado pela sua instituição.",
    type: "info",
  },
  SCHOOL_UPDATE: {
    message: "Sua instituição fez uma atualização importante.",
    type: "info",
  },

  // Notificações de Chat
  CHAT_MESSAGE_RECEIVED: {
    message: "Você recebeu uma nova mensagem no chat.",
    type: "info",
  },
  CHAT_MESSAGE_SENT: {
    message: "Sua mensagem foi enviada.",
    type: "info",
  },
  CHAT_MESSAGE_READ: {
    message: "Sua mensagem foi lida.",
    type: "info",
  },
};

module.exports = NOTIFICATION_TYPES;
