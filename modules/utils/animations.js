import { FadeIn, Layout, FadeOut } from "react-native-reanimated";

const animations = {
  viewToBeScreen: {
    mainTitleText: {
      entering: FadeIn,
      layout: Layout.duration(800),
    }
  },
  plans: {
    planView: {
      entering: FadeIn.duration(500),
      exiting: FadeOut.duration(500),
    },
    planItemForFlatList: {
      entering: FadeIn.delay(400).duration(1000),
    }
  },
  addPlan: {
    addPlanView: {
      entering: FadeIn.duration(500),
      exiting: FadeOut.duration(500),
    }
  }

}

export { animations }