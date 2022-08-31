import { FadeIn, Layout, FadeOut } from 'react-native-reanimated';

const animations = {
  viewToBeScreen: {
    mainTitleText: {
      entering: FadeIn.duration(1000),
      layout: Layout.duration(500),
    },
    detailsButton: {
      entering: FadeIn.duration(500).delay(500),
      exiting: FadeOut.duration(800),
    },
  },
  plans: {
    planView: {
      entering: FadeIn.duration(800),
      exiting: FadeOut.duration(250),
      layout: Layout.duration(500),
    },
    planItemForFlatList: {
      entering: FadeIn.duration(1000),
      exiting: FadeOut.duration(250),
      layout: Layout.duration(500),
    },
  },
  addPlan: {
    addPlanView: {
      entering: FadeIn.duration(500),
      exiting: FadeOut.duration(500),
    },
  },
};

export default animations;
