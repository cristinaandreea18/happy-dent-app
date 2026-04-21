import './ConfirmationWidget.css';
import { createClientMessage } from 'react-chatbot-kit';

const ConfirmationWidget = ({ actionProvider, payload, state }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'dată necunoscută';
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const buttons = [
    {
      text: '✅ Confirmă',
      action: payload?.confirmAction || 'confirmReschedule',
      className: 'reschedule-confirm-button',
      clientMessage: `Confirm reprogramarea de la ${
        payload.appointment?.time
      } pe ${formatDate(payload.appointment?.appointmentDate)} la ${
        payload.slot?.time
      } pe ${formatDate(payload.slot?.date)}.`,
    },
    {
      text: 'Înapoi',
      action: payload?.backAction,
      className: 'back-button',
      clientMessage: 'Înapoi',
    },
  ];
  const backButton = buttons.find((b) => b.className === 'back-button');
  const mainButtons = buttons.filter((b) => b.className !== 'back-button');

  const currentStep = state?.currentStep;
  const stepId = payload?.stepId;

  const isCurrentStep = stepId === currentStep;

  const handleClick = (button) => {
    if (!isCurrentStep) {
      console.warn('[Blocare] ConfirmWidget: pas vechi:', stepId);
      return;
    }

    const clientMessage = createClientMessage(button.clientMessage);
    actionProvider.addMessageToState(clientMessage);

    const specificAction =
      payload?.[`${button.className.replace('-button', '')}Action`];

    if (specificAction && actionProvider[specificAction]) {
      actionProvider[specificAction]();
      return;
    }

    if (button.action === 'showAvailableSlots') {
      const slotsContext = payload?.slotsContext;

      if (slotsContext?.originalSlots?.length) {
        const now = new Date();
        const filteredSlots = slotsContext.originalSlots.filter((slot) => {
          const slotDateTime = new Date(`${slot.date}T${slot.time}`);
          return slotDateTime > now;
        });

        if (filteredSlots.length > 0) {
          actionProvider.showAvailableSlots(filteredSlots);
          return;
        }
      }

      if (slotsContext?.source && actionProvider[slotsContext.source]) {
        actionProvider[slotsContext.source]();
      } else {
        actionProvider.showAvailableSlots([]);
      }
    } else if (button.action && actionProvider[button.action]) {
      actionProvider[button.action]();
    }
  };

  return (
    <div className="button-options">
      <div className="main-buttons">
        {mainButtons.map((button, index) => (
          <button
            key={index}
            className="chat-button"
            onClick={() => handleClick(button)}
          >
            {button.text}
          </button>
        ))}
      </div>

      {backButton && (
        <div className="back-button-container">
          <button
            className={backButton.className}
            onClick={() => handleClick(backButton)}
          >
            {backButton.text}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmationWidget;
