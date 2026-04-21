import { createChatBotMessage } from 'react-chatbot-kit';
import OptionsWidget from './widgets/OptionsWidget';
import RescheduleSlotsWidget from './widgets/RescheduleSlotsWidget';
import ConfirmationWidget from './widgets/ConfirmationWidget';
import CustomBotAvatar from '../CustomBotAvatar/CustomBotAvatar';

const botConfig = {
  botName: 'DentAssist',
  customComponents: {
    botAvatar: (props) => <CustomBotAvatar {...props} />,
  },
  initialMessages: [
    createChatBotMessage(
      'Bună! Sunt asistentul tău virtual. Cu ce te pot ajuta?',
      {
        widget: 'optionsWidget',
        payload: {
          buttons: [
            { text: 'Reprogramare', action: 'showAppointments' },
            {
              text: 'Anulare programare',
              action: 'showAppointmentsForCancellation',
            },
          ],
          stepId: 'welcome',
        },
      }
    ),
  ],

  state: {
    appointments: null,
    currentAppointment: '',
    selectedDoctorId: '',
    availableSlots: null,
    appointmentStore: null,
    slots: [],
    currentStep: '',
  },
  widgets: [
    {
      widgetName: 'optionsWidget',
      widgetFunc: (props) => <OptionsWidget {...props} />,
      props: {},
      mapStateToProps: ['appointments'],
    },
    {
      widgetName: 'rescheduleSlotsWidget',
      widgetFunc: (props) => <RescheduleSlotsWidget {...props} />,
      mapStateToProps: ['availableSlots'],
    },
    {
      widgetName: 'confirmationWidget',
      widgetFunc: (props) => <ConfirmationWidget {...props} />,
      mapStateToProps: ['appointments', 'availableSlots'],
    },
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#376B7E',
    },
    chatButton: {
      backgroundColor: '#376B7E',
    },
  },
};

export default botConfig;
