import { ImageSourcePropType } from 'react-native';
import { Group } from './workoutData';

// One PNG per muscle card, loaded from eos/assets (chest.png, back.png, ...). screens/ lives in eos/src, so the path is ../../assets/.
// If your assets folder is somewhere else, only change the paths below (e.g. '../../assets/' or '../../assets/muscles/').
export const MUSCLE_IMG: Record<Group, ImageSourcePropType> = {
  Chest: require('../../assets/chest.png'),
  Back: require('../../assets/back.png'),
  Shoulders: require('../../assets/shoulders.png'),
  Biceps: require('../../assets/biceps.png'),
  Triceps: require('../../assets/triceps.png'),
  Forearms: require('../../assets/forearms.png'),
  Legs: require('../../assets/legs.png'),
  Core: require('../../assets/core.png'),
};
