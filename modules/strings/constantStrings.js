const CONSTANT_STRINGS = {
  UNSPLASH_IMAGE_SEARCH: {
    INPUT_PLACEHOLDER: 'Search for images',
    ON_ERROR_RESPONSE_MESSAGE: "We're sorry, there was an error getting images from Unsplash.",
    ON_NO_RESULTS_MESSAGE: 'No matching photos could be found for your search. \n\nPlease try a different search.',
  },
  ADD_NEW_SCREEN: {
    IMAGE_PICKER_INSTRUCTION: 'Find a background image',
  },
  PLANS: {
    REPEATERS: {
      HEADER_TEXT_DAILIES: 'Dailies',
      HEADER_TEXT_WEEKLIES: 'Weeklies',
      HEADER_TEXT_MONTHLIES: 'Monthlies',
      SET_END_DATE_PROMPT: 'Add an end date for this recurring plan.',
      REMOVE_ALERT_MAIN_TITLE: 'Stop this recurring plan?',
      REMOVE_ALERT_DESCRIPTION: 'It will remain available in your non-recurring plans.',
      REMOVE_ALERT_CONFIRM_BUTTON_TITLE: 'Remove',
    },
    ADD_PLAN: {
      PROMPT_TEXT: (toBeItemTitle) => (
        `How can you be more ${toBeItemTitle}?`
      ),
    },
  },
};

export default CONSTANT_STRINGS;
