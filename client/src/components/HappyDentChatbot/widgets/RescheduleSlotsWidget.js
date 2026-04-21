import { createClientMessage } from 'react-chatbot-kit';
import './RescheduleSlotsWidget.css';

const RescheduleSlotsWidget = ({ actionProvider, payload, state }) => {
  const currentStep = state?.currentStep;
  const stepId = payload?.stepId;

  const handleSlotSelect = (slot) => {
    if (stepId && stepId !== currentStep) {
      console.warn(
        '[Blocare] Slot selectat din pas vechi:',
        stepId,
        'vs',
        currentStep
      );
      return;
    }

    const clientMessage = createClientMessage(
      `Am selectat ${slot.dayName}, ${slot.formattedDate} la ${slot.time}`
    );
    actionProvider.addMessageToState(clientMessage);
    actionProvider.handleSlotSelection(slot);
  };

  const isMorning = (time) => {
    const [hour] = time.split(':').map(Number);
    return hour < 12;
  };

  const groupedSlots = payload.slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = { morning: [], afternoon: [] };
    if (isMorning(slot.time)) {
      acc[slot.date].morning.push(slot);
    } else {
      acc[slot.date].afternoon.push(slot);
    }
    return acc;
  }, {});

  return (
    <div className="slots-container">
      <h4>{payload.title}</h4>
      <div className="slots-grid-grouped">
        {Object.entries(groupedSlots).map(
          ([_, { morning, afternoon }], idx) => {
            const sampleSlot = morning[0] || afternoon[0];
            return (
              <div className="date-group" key={idx}>
                <div className="date-label">
                  📅 {sampleSlot.dayName}, {sampleSlot.formattedDate}
                </div>

                {morning.length > 0 && (
                  <>
                    <div className="time-of-day">☀️ Dimineață</div>
                    <div className="slots-subgrid">
                      {morning.map((slot, i) => (
                        <button
                          key={`m-${i}`}
                          className="slot-button small"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {afternoon.length > 0 && (
                  <>
                    <div className="time-of-day">🌇 După-amiază</div>
                    <div className="slots-subgrid">
                      {afternoon.map((slot, i) => (
                        <button
                          key={`a-${i}`}
                          className="slot-button small"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          }
        )}
      </div>

      {payload.backAction && (
        <button
          className="back-button"
          onClick={() => {
            if (stepId !== currentStep) {
              console.warn('[Blocare] Înapoi ignorat din pas vechi:', stepId);
              return;
            }
            actionProvider[payload.backAction]();
          }}
        >
          ⬅️ Înapoi
        </button>
      )}
    </div>
  );
};

export default RescheduleSlotsWidget;
