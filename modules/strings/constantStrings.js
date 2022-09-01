const CONSTANT_STRINGS = {

  BE_SCREEN: {
    HEADER_TITLE: 'Be...',
    LIST_EMPTY_MESSAGE: "To get started, add a new 'to be' to your list.",
  },
  UNSPLASH_IMAGE_SEARCH: {
    INPUT_PLACEHOLDER: 'Search for images',
    ON_ERROR_RESPONSE_MESSAGE: "We're sorry, there was an error getting images from Unsplash.",
    ON_NO_RESULTS_MESSAGE: 'No matching photos could be found for your search. \n\nPlease try a different search.',
    CHOOSE_IMAGE_TEXT: 'Choose',
    IMAGE_ATTRIBUTION: (name) => (`${name} / Unsplash`),
  },
  ADD_NEW_SCREEN: {
    IMAGE_PICKER_INSTRUCTION: 'Find a background image',
  },
  PLANS: {
    ADD_PLAN: {
      PROMPT_TEXT: (toBeItemTitle) => (
        `How can you be more ${toBeItemTitle}?`
      ),
    },
    ADD_CAL_EVENT_DATETIMEPICKER_HEADER: 'Add an event to the calendar for this plan.',
    PLAN_DETAIL_PLACEHOLDER: 'Add more details here',
    REPEATERS: {
      HEADER_TEXT_DAILIES: 'Dailies',
      HEADER_TEXT_WEEKLIES: 'Weeklies',
      HEADER_TEXT_MONTHLIES: 'Monthlies',
      SET_END_DATE_PROMPT: 'Add an end date for this recurring plan.',
      REMOVE_ALERT_MAIN_TITLE: 'Stop this recurring plan?',
      REMOVE_ALERT_DESCRIPTION: 'It will remain available in your non-recurring plans.',
      REMOVE_ALERT_CONFIRM_BUTTON_TITLE: 'Remove',
      COMPLETION_TOAST_HEADER: () => {
        // can add more messages here
        const congrats = ['Well done!', 'Awesome!', 'Great work!'];
        return congrats[Math.floor(Math.random() * congrats.length)];
      },
      COMPLETION_TOAST_CONTENT: (periodicity) => {
        let messageSuffix;
        switch (periodicity) {
          case 'daily':
            messageSuffix = 'tomorrow';
            break;
          case 'weekly':
            messageSuffix = 'next week';
            break;
          case 'monthly':
            messageSuffix = 'next month';
            break;
          default:
            messageSuffix = '';
        }
        return `Keep it up ${messageSuffix}.`;
      },
    },
  },
};

export default CONSTANT_STRINGS;
