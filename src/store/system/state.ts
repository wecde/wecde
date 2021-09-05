export type SystemStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  navigation: boolean;
  // eslint-disable-next-line functional/prefer-readonly-type
  navTabGit: boolean;
};

function state(): SystemStateInterface {
  return {
    navigation: false,
    navTabGit: false,
  };
}

export default state;
