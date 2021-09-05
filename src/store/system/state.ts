export type SystemStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  navigation: boolean;
};

function state(): SystemStateInterface {
  return {
    navigation: false,
  };
}

export default state;
