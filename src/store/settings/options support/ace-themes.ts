const themeData = [
  ["Chrome"],
  ["Clouds"],
  ["Crimson Editor"],
  ["Dawn"],
  ["Dreamweaver"],
  ["Eclipse"],
  ["GitHub"],
  ["IPlastic"],
  ["Solarized Light"],
  ["TextMate"],
  ["Tomorrow"],
  ["Xcode"],
  ["Kuroir"],
  ["KatzenMilch"],
  ["SQL Server", "sqlserver", "light"],
  ["Ambiance", "ambiance", "dark"],
  ["Chaos", "chaos", "dark"],
  ["Clouds Midnight", "clouds_midnight", "dark"],
  ["Dracula", "", "dark"],
  ["Cobalt", "cobalt", "dark"],
  ["Gruvbox", "gruvbox", "dark"],
  ["Green on Black", "gob", "dark"],
  ["idle Fingers", "idle_fingers", "dark"],
  ["krTheme", "kr_theme", "dark"],
  ["Merbivore", "merbivore", "dark"],
  ["Merbivore Soft", "merbivore_soft", "dark"],
  ["Mono Industrial", "mono_industrial", "dark"],
  ["Monokai", "monokai", "dark"],
  ["Nord Dark", "nord_dark", "dark"],
  ["Pastel on dark", "pastel_on_dark", "dark"],
  ["Solarized Dark", "solarized_dark", "dark"],
  ["Terminal", "terminal", "dark"],
  ["Tomorrow Night", "tomorrow_night", "dark"],
  ["Tomorrow Night Blue", "tomorrow_night_blue", "dark"],
  ["Tomorrow Night Bright", "tomorrow_night_bright", "dark"],
  ["Tomorrow Night 80s", "tomorrow_night_eighties", "dark"],
  ["Twilight", "twilight", "dark"],
  ["Vibrant Ink", "vibrant_ink", "dark"],
];

export const themes = themeData.map(function (data) {
  const name = data[1] || data[0].replace(/ /g, "_").toLowerCase();
  const theme = {
    value: "ace/theme/" + name,
    label: data[0] + (data[2] == "dark" ? " (dark)" : ""),
  };
  return theme;
});
