import './OptionsWidget.css';
import { createClientMessage } from 'react-chatbot-kit';

const OptionsWidget = ({ actionProvider, payload, state }) => {
  const buttons = payload?.buttons || [];
  const stepId = payload?.stepId;
  const currentStep = state?.currentStep;

  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  const isLastStepMessage = lastMessage?.payload?.stepId === stepId;

  console.log('[OptionsWidget] payload:', payload);
  console.log('[OptionsWidget] stepId:', stepId);
  console.log('[OptionsWidget] currentStep:', currentStep);

  const mainButtons = buttons.filter((b) => b.className !== 'back-button');
  const backButton = buttons.find((b) => b.className === 'back-button');

  const handleClick = (button) => {
    if (!isLastStepMessage) {
      const isBackButton = button.className === 'back-button';

      console.warn(
        '[Blocare] Acțiune ignorată pentru stepId vechi:',
        stepId,
        'vs',
        currentStep
      );
      return;
    }

    const clientMessage = createClientMessage(button.text);
    actionProvider.addMessageToState(clientMessage);

    if (button.action && typeof actionProvider[button.action] === 'function') {
      if (button.data) {
        actionProvider[button.action](button.data);
      } else {
        actionProvider[button.action]();
      }
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

export default OptionsWidget;
