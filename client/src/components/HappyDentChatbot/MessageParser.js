class MessageParser {
  constructor(actionProvide) {
    this.actionProvider = actionProvide;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (
      lowerCaseMessage.includes('zile libere') ||
      lowerCaseMessage.includes('liber')
    ) {
      this.actionProvider.handleFreeDays();
    } else if (
      lowerCaseMessage.includes('reprogramare') ||
      lowerCaseMessage.includes('reprogramează')
    ) {
      this.actionProvider.handleReschedule();
    } else if (
      lowerCaseMessage.includes('anulare') ||
      lowerCaseMessage.includes('anulează')
    ) {
      this.actionProvider.handleCancelAppointment();
    } else if (
      [
        'detartraj',
        'gutiera',
        'implant',
        'albire',
        'obturatie',
        'preț',
        'cât costă',
        'durere',
        'mă doare',
        'gingie',
        'sângerare',
      ].some((kw) => lowerCaseMessage.includes(kw))
    ) {
      this.actionProvider.handleTreatmentQuestion(message);
    } else {
      this.actionProvider.showWelcomeMessage();
    }
  }
}

export default MessageParser;
