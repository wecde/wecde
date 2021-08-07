export type SystemStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  navigation: boolean;
  // eslint-disable-next-line functional/prefer-readonly-type
  progress: boolean;
};

function state(): SystemStateInterface {
  return {
    navigation: false,
    progress: false,
  };
}

export default state;
