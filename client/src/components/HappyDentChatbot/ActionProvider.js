class ActionProvider {
  constructor(
    createChatBotMessage,
    setStateFunc,
    createClientMessage,
    stateRef
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.stateRef = stateRef;
  }

  addMessageToState = (message) => {
    console.log('[DEBUG] Mesaj adăugat:', message);

    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };

  showMessageWithButtons = (messageText, buttons, stepId = '') => {
    const message = this.createChatBotMessage(messageText, {
      widget: 'optionsWidget',
      payload: { buttons, stepId },
    });

    console.log('[DEBUG] Sending message with stepId:', stepId);
    console.log('[DEBUG] Payload:', { buttons, stepId });

    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      buttons,
      currentStep: stepId,
    }));

    this.stateRef.currentStep = stepId;
  };

  //    console.log('Current stateRef:', this.stateRef);
  //    console.log('Showing appointments for cancellation?', forCancellation);

  showWelcomeMessage = () => {
    const buttons = [
      { text: 'Reprogramare', action: 'showAppointments' },
      { text: 'Anulare programare', action: 'showAppointmentsForCancellation' },
    ];

    this.showMessageWithButtons(
      'Bună! Sunt asistentul tău virtual. Cu ce te pot ajuta?',
      buttons,
      'welcome'
    );
  };

  showAppointmentsForCancellation = () => {
    this.showAppointments(true);
  };

  showAppointments = (forCancellation = false) => {
    this.stateRef.currentStep = forCancellation
      ? 'cancelAppointments'
      : 'selectAppointment';

    const appointments = this.stateRef.appointments;

    if (!appointments?.length) {
      this.addMessageToState(this.createChatBotMessage('Nu ai programări.'));
      return;
    }

    const now = new Date();
    const futureAppointments = appointments.filter((app) => {
      try {
        const appointmentDateStr = `${app.appointmentDate.split('T')[0]}T${
          app.time
        }`;
        const appointmentDate = new Date(appointmentDateStr);
        return appointmentDate > now && app.status !== 'Cancelled';
      } catch (error) {
        console.error('Eroare la parsarea datei:', error);
        return false;
      }
    });

    if (!futureAppointments.length) {
      this.addMessageToState(
        this.createChatBotMessage('Nu ai programări viitoare.')
      );
      return;
    }

    const buttons = futureAppointments.map((app) => {
      const formatDate = (dateStr) => {
        try {
          const [year, month, day] = dateStr.split('T')[0].split('-');
          return `${day}-${month}-${year}`;
        } catch {
          return dateStr.split('T')[0];
        }
      };

      const date = formatDate(app.appointmentDate);
      const time = app.time || 'Ora necunoscută';

      return {
        text: `${date} la ora ${time}`,
        action: forCancellation
          ? 'confirmCancelAppointment'
          : 'handleAppointmentSelect',
        data: app,
      };
    });

    buttons.push({
      text: 'Înapoi',
      action: 'showWelcomeMessage',
      className: 'back-button',
    });

    this.showMessageWithButtons(
      forCancellation
        ? 'Selectează programarea pe care dorești să o anulezi:'
        : 'Alege o programare:',
      buttons,
      this.stateRef.currentStep
    );
  };

  executeAppointmentCancellation = async () => {
    try {
      const { currentAppointment } = this.stateRef;
      console.log('current app for cancel', currentAppointment);

      if (!currentAppointment?.appointmentId) {
        throw new Error('Nu există programare selectată');
      }

      const response =
        await this.stateRef.appointmentStore.updateAppointmentStatus(
          currentAppointment.appointmentId,
          'Cancelled'
        );
      if (response.success) {
        this.addMessageToState(
          this.createChatBotMessage('Programarea a fost anulată.')
        );
      }
      this.stateRef.selectedSlot = null;

      this.setState((prev) => ({
        ...prev,
        currentStep: null,
      }));
      this.stateRef.currentStep = null;
    } catch (error) {
      this.addMessageToState(
        this.createChatBotMessage(
          'A apărut o eroare la anulare. Vă rugăm încercați din nou.'
        )
      );
      console.log('Error', error);
    }
  };

  confirmCancelAppointment = (
    selectedAppointment = this.stateRef.currentAppointment
  ) => {
    console.log('[DEBUG] confirmCancelAppointment called', selectedAppointment);

    this.stateRef.currentStep = 'confirmReschedule';

    this.setState((prev) => ({
      ...prev,
      currentAppointment: selectedAppointment,
      currentStep: 'confirmReschedule',
    }));

    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}-${month}-${year}`;
    };

    const message = this.createChatBotMessage(
      `Confirmi anularea programării din ${formatDate(
        selectedAppointment.appointmentDate
      )} la ${selectedAppointment.time}?`,
      {
        widget: 'confirmationWidget',
        payload: {
          confirmAction: 'executeAppointmentCancellation',
          cancelAction: 'showAppointmentsForCancellation',
          backAction: 'showAppointmentsForCancellation',
          context: { forCancellation: true },
          stepId: 'confirmReschedule',
        },
      }
    );

    this.addMessageToState(message);
  };

  //    console.log('PROGRAMAREA CURENTA', selectedAppointment);
  //    console.log('Doctor', selectedAppointment?.doctorId);

  handleAppointmentSelect = (
    selectedAppointment = this.stateRef.currentAppointment
  ) => {
    this.stateRef.currentStep = 'appointmentSelect';

    this.setState((prev) => ({
      ...prev,
      currentAppointment: selectedAppointment,
      selectedDoctorId: selectedAppointment?.doctorId,
      currentStep: 'appointmentSelect',
    }));

    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}-${month}-${year}`;
    };

    this.addMessageToState(
      this.createChatBotMessage(
        `Ai selectat programarea din ${formatDate(
          selectedAppointment.appointmentDate
        )}. Alege perioada pentru reprogramare:`,
        {
          widget: 'optionsWidget',
          payload: {
            buttons: [
              { text: 'Săptămâna curentă', action: 'showCurrentWeekSlots' },
              { text: 'Săptămâna viitoare', action: 'showNextWeekSlots' },
              {
                text: 'Înapoi',
                action: 'showAppointments',
                className: 'back-button',
              },
            ],
            stepId: 'appointmentSelect',
          },
        }
      )
    );
  };

  //      console.log('>>>> showCurrentWeekSlots CALLED <<<<');
  //      console.log('current week slots', availableSlots);
  //      console.log('Ziua programării (Luni=0):', dayOfWeek);
  //      console.log('Zile rămase în săptămână:', daysRemaining);

  showCurrentWeekSlots = async () => {
    try {
      const { selectedDoctorId, currentAppointment, availableSlots } =
        this.stateRef;

      this.stateRef.lastSlotsSource = 'showCurrentWeekSlots';

      if (!selectedDoctorId) throw new Error('Nu este selectat niciun doctor');
      if (!currentAppointment?.appointmentDate)
        throw new Error('Nu există programare selectată');

      const appointmentDate = new Date(currentAppointment.appointmentDate);
      appointmentDate.setHours(0, 0, 0, 0);

      const dayOfWeek = (appointmentDate.getDay() + 6) % 7;
      const daysRemaining = 6 - dayOfWeek;

      if (!availableSlots?.getAvailableSlots) {
        throw new Error('Store-ul pentru sloturi nu este disponibil');
      }

      const slotsPromises = [];

      for (let i = 0; i <= daysRemaining; i++) {
        const date = new Date(appointmentDate);
        date.setDate(appointmentDate.getDate() + i);
        console.log('data', date);
        const dateStr = date.toISOString().split('T')[0];

        slotsPromises.push(
          availableSlots.getAvailableSlots(selectedDoctorId, dateStr)
        );
      }

      const weekSlots = await Promise.all(slotsPromises);

      const filteredSlots = weekSlots
        .filter((day) => day?.slots?.length)
        .flatMap((day) =>
          day.slots.map((slotTime) => ({
            date: day.appointmentDate,
            time: slotTime,
            datetime: new Date(`${day.appointmentDate}T${slotTime}`),
          }))
        );

      this.stateRef.currentStep = 'slotSelection';

      this.setState((prev) => ({
        ...prev,
        slots: filteredSlots,
        currentStep: 'slotSelection',
      }));

      this.showAvailableSlots(filteredSlots);
    } catch (error) {
      console.error('Eroare la obținerea sloturilor:', error);
      this.addMessageToState(
        this.createChatBotMessage(
          error.message ||
            'A apărut o eroare la obținerea sloturilor disponibile.'
        )
      );
    }
  };

  showNextWeekSlots = async () => {
    console.log('>>>> showNextWeekSlots (filtered) CALLED <<<<');

    try {
      this.stateRef.lastSlotsSource = 'showNextWeekSlots';

      const { selectedDoctorId, currentAppointment, availableSlots } =
        this.stateRef;

      if (!selectedDoctorId) throw new Error('Nu este selectat niciun doctor');
      if (!currentAppointment?.appointmentDate || !currentAppointment?.time)
        throw new Error('Programarea curentă nu are dată sau oră');

      const appointmentDate = new Date(currentAppointment.appointmentDate);
      const [hours, minutes] = currentAppointment.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const appointmentDateTime = appointmentDate;
      console.log('Date time', appointmentDateTime);

      // Startul săptămânii viitoare: luni
      const startOfNextWeek = new Date(appointmentDateTime);
      const dayOfWeek = appointmentDateTime.getDay(); // 0 = Sunday
      const daysUntilNextMonday = (8 - dayOfWeek) % 7 || 7;
      startOfNextWeek.setDate(startOfNextWeek.getDate() + daysUntilNextMonday);

      // Obține sloturi pentru următoarele 7 zile
      const slotsPromises = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfNextWeek);
        date.setDate(startOfNextWeek.getDate() + i);

        const dateStr = date.toISOString().split('T')[0];
        return availableSlots.getAvailableSlots(selectedDoctorId, dateStr);
      });

      const weeklySlots = await Promise.all(slotsPromises);

      const availableSlotsList = weeklySlots
        .filter((slotData) => slotData?.slots?.length > 0)
        .flatMap((slotData) =>
          slotData.slots.map((slotTime) => {
            const datetime = new Date(
              `${slotData.appointmentDate}T${slotTime}`
            );
            return {
              date: slotData.appointmentDate,
              time: slotTime,
              datetime,
            };
          })
        )
        .filter((slot) => slot.datetime > appointmentDateTime);

      this.stateRef.currentStep = 'slotSelection';

      this.setState((prev) => ({
        ...prev,
        slots: availableSlotsList,
        currentStep: 'slotSelection',
      }));

      this.showAvailableSlots(availableSlotsList);
    } catch (error) {
      console.error('Eroare la obținerea sloturilor:', error);
      this.addMessageToState(
        this.createChatBotMessage(
          error.message ||
            'A apărut o eroare la obținerea sloturilor disponibile.'
        )
      );
    }
  };

  getAvailableSlots = (weeksToAdd) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + weeksToAdd * 7);
    startDate.setHours(0, 0, 0, 0);

    console.log('Am nevoie de consiliere', this.stateRef?.calendarData);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 6 zile pentru săptămână completă

    // Obținem programul doctorului din state
    const workingHours = this.stateRef.doctorWorkingHours || {};
    const appointments =
      this.stateRef.appointments?.[0]?.data?.appointments || [];

    console.log('Working hours:', workingHours);
    console.log('Programări existente:', appointments);

    // Generăm sloturi disponibile
    const availableSlots = [];

    // Iterăm prin fiecare zi a săptămânii
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      const dayName = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const daySchedule = workingHours[dayName];

      // Verificăm dacă doctorul lucrează în acea zi
      if (daySchedule?.enabled) {
        const [startHour, startMinute] = daySchedule.start
          .split(':')
          .map(Number);
        const [endHour, endMinute] = daySchedule.end.split(':').map(Number);

        // Generăm sloturi de 30 de minute
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            if (hour === endHour - 1 && minute + 30 > endMinute) {
              continue; // Sărim peste sloturile care depășesc ora de închidere
            }

            const slotStart = new Date(currentDate);
            slotStart.setHours(hour, minute, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotStart.getMinutes() + 30);

            // Verificăm dacă slotul este liber
            const isAvailable = !appointments.some((app) => {
              const appDate = new Date(
                `${app.appointmentDate.split('T')[0]}T${app.time}`
              );
              const appEnd = new Date(appDate);
              appEnd.setMinutes(appDate.getMinutes() + app.duration);

              return slotStart < appEnd && slotEnd > appDate;
            });

            if (isAvailable) {
              availableSlots.push({
                date: slotStart.toISOString().split('T')[0],
                time: `${hour.toString().padStart(2, '0')}:${minute
                  .toString()
                  .padStart(2, '0')}`,
                datetime: slotStart,
              });
            }
          }
        }
      }
    }

    return availableSlots;
  };

  showAvailableSlots = (slots) => {
    this.stateRef.currentStep = 'slotSelection';

    console.log('[DEBUG] this.stateRef.slots:', this.stateRef.slots);

    if (!slots.length) {
      this.addMessageToState(
        this.createChatBotMessage(
          'Nu există sloturi disponibile în perioada selectată.'
        )
      );
      return;
    }

    const appointmentDate = this.stateRef.currentAppointment?.appointmentDate;
    const appointmentDateTime = appointmentDate
      ? new Date(`${appointmentDate.split('T')[0]}T00:00:00`)
      : null;

    const now = new Date();
    const filteredSlots = slots.filter((slot) => {
      const slotDateStr = slot.date || slot.appointmentDate;
      if (!slotDateStr) return false;

      const slotDate = new Date(slotDateStr);
      if (appointmentDateTime && slotDate < appointmentDateTime) {
        return false;
      }

      const slotDateTime = new Date(`${slotDateStr}T${slot.time}`);
      return slotDateTime > now;
    });

    if (!filteredSlots.length) {
      this.addMessageToState(
        this.createChatBotMessage(
          'Nu există sloturi disponibile după data programării selectate.'
        )
      );
      return;
    }

    const slotsWithLabels = filteredSlots.map((slot) => {
      const dateStr = slot.date || slot.appointmentDate;
      const dateObj = new Date(dateStr);

      const dayName = dateObj.toLocaleDateString('ro-RO', {
        weekday: 'long',
      });
      const formattedDate = dateObj.toLocaleDateString('ro-RO');

      return {
        ...slot,
        dayName,
        formattedDate,
      };
    });

    this.stateRef.currentStep = 'slotSelection';
    this.setState((prev) => ({
      ...prev,
      currentStep: 'slotSelection',
    }));

    this.addMessageToState(
      this.createChatBotMessage('Sloturi disponibile pentru reprogramare:', {
        widget: 'rescheduleSlotsWidget',
        payload: {
          title: 'Selectează un slot disponibil:',
          slots: slotsWithLabels,
          backAction: 'handleAppointmentSelect',
          currentAppointment: this.stateRef.currentAppointment,
          slotsSource: this.stateRef.lastSlotsSource,
          stepId: 'slotSelection',
        },
      })
    );
  };

  handleSlotSelection = (slot) => {
    this.setState((prev) => ({
      ...prev,
      selectedSlot: slot,
    }));

    this.stateRef.selectedSlot = slot;
    this.showConfirmation();
  };

  showConfirmation = () => {
    const { selectedSlot, currentAppointment, slots } = this.stateRef;

    this.stateRef.currentStep = 'confirmReschedule';
    this.setState((prev) => ({
      ...prev,
      currentStep: 'confirmReschedule',
    }));

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Data necunoscută';

      try {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}-${month}-${year}`;
      } catch (e) {
        console.error('Eroare formatare data:', e);
        return dateStr.split('T')[0];
      }
    };

    const date = formatDate(currentAppointment.appointmentDate);
    const time = currentAppointment.time || 'Ora necunoscută';

    const message = this.createChatBotMessage(
      `Confirmi reprogramarea de la ${time} pe ${date} ` +
        `la ${selectedSlot.time} pe ${formatDate(selectedSlot.date)}?`,
      {
        widget: 'confirmationWidget',
        payload: {
          slot: selectedSlot,
          appointment: currentAppointment,
          originalSlots: slots,
          backAction: 'goBackToSlots',
          stepId: 'confirmReschedule',
          slotsSource: this.stateRef.lastSlotsSource,
        },
      }
    );

    this.addMessageToState(message);
  };

  //   console.log('slots', slots);
  //   console.log('selected slot', selectedSlot);

  goBackToSlots = () => {
    const { slots } = this.stateRef;

    if (slots?.length) {
      this.showAvailableSlots(slots);
    } else {
      if (this.stateRef?.lastSlotsSource === 'showCurrentWeekSlots') {
        this.showCurrentWeekSlots();
      } else if (this.stateRef?.lastSlotsSource === 'showNextWeekSlots') {
        this.showNextWeekSlots();
      } else {
        this.addMessageToState(
          this.createChatBotMessage('Nu există sloturi anterioare salvate.')
        );
      }
    }
  };

  confirmReschedule = async () => {
    try {
      const {
        selectedSlot,
        currentAppointment,
        appointmentStore,
        availableSlots,
      } = this.stateRef;

      if (!selectedSlot || !currentAppointment?.appointmentId) {
        throw new Error('Date incomplete pentru reprogramare');
      }

      const duration = currentAppointment.duration || 30;
      const oldDate = currentAppointment.appointmentDate;
      const oldTime = currentAppointment.time;
      const newDate = selectedSlot.date;
      const newTime = selectedSlot.time;
      const newDateTime = `${newDate}T${newTime}:00`;

      const getSlotRange = (startTime, durationMinutes) => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const slots = [];

        const start = new Date();
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + durationMinutes);

        const current = new Date(start);
        while (current < end) {
          const h = String(current.getHours()).padStart(2, '0');
          const m = String(current.getMinutes()).padStart(2, '0');
          slots.push(`${h}:${m}`);
          current.setMinutes(current.getMinutes() + 30);
        }

        return slots;
      };

      // 1. Adaugă sloturile vechi înapoi
      const oldSlotRange = getSlotRange(oldTime, duration);
      const oldSlotsData = await availableSlots.getAvailableSlots(
        currentAppointment.doctorId,
        oldDate
      );
      const existingOldSlots = Array.isArray(oldSlotsData?.slots)
        ? oldSlotsData.slots
        : [];

      const updatedOldSlots = Array.from(
        new Set([...existingOldSlots, ...oldSlotRange])
      ).sort();

      await availableSlots.updateAvailableSlots(
        currentAppointment.doctorId,
        oldDate,
        updatedOldSlots
      );

      // 2. Update backend cu noua dată
      const response = await appointmentStore.updateAppointmentDateTime(
        currentAppointment.appointmentId,
        newDateTime
      );

      if (!response.success) {
        throw new Error('Reprogramarea a eșuat.');
      }

      // 3. Scoate sloturile noi
      const newSlotRange = getSlotRange(newTime, duration);
      const newSlotsData = await availableSlots.getAvailableSlots(
        currentAppointment.doctorId,
        newDate
      );

      const updatedNewSlots = (newSlotsData?.slots || []).filter(
        (slot) => !newSlotRange.includes(slot)
      );

      await availableSlots.updateAvailableSlots(
        currentAppointment.doctorId,
        newDate,
        updatedNewSlots
      );

      // 4. Confirmare pentru utilizator
      const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}-${month}-${year}`;
      };

      this.addMessageToState(
        this.createChatBotMessage(
          `Vizita a fost reprogramată cu succes pentru ${formatDate(
            newDate
          )} la ${newTime}!`
        )
      );

      this.setState((prev) => ({
        ...prev,
        currentStep: null,
      }));
      this.stateRef.currentStep = null;
    } catch (error) {
      this.addMessageToState(
        this.createChatBotMessage(
          'A apărut o eroare la reprogramare. Vă rugăm încercați din nou.'
        )
      );
      console.error('Eroare confirmReschedule:', error);
    } finally {
      this.stateRef.selectedSlot = null;
      this.stateRef.currentAppointment = null;
    }
  };
}
export default ActionProvider;
