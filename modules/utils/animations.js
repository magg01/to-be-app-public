import { FadeIn, Layout, FadeOut, SlideInRight, SlideInUp, SlideInDown, SlideOutDown } from "react-native-reanimated";

const animations = {
  viewToBeScreen: {
    mainTitleText: {
      entering: FadeIn.duration(1000),
      layout: Layout.duration(800),
    },
    detailsButton: {
      entering: FadeIn.duration(1000).delay(500),
      exiting: FadeOut.duration(800),
    }
  },
  plans: {
    planView: {
      entering: FadeIn.duration(800),
      exiting: FadeOut.duration(1000),
      layout: Layout.duration(1000),
    },
    planItemForFlatList: {
      entering: FadeIn.duration(1000),
      exiting: FadeOut.duration(1000),
      layout: Layout.delay(2000),
    },
  },
  addPlan: {
    addPlanView: {
      entering: FadeIn.duration(500),
      exiting: FadeOut.duration(500),
    }
  }

}

export { animations }