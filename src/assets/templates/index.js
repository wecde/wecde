const fs = require("fs");

const all = fs
  .readdirSync(__dirname)
  .map((item) => {
    if (fs.statSync(__dirname + "/" + item).isDirectory()) {
      return {
        name: item.replace(/^\d+\. ?/g, ""),
        project: item,
        index: item.match(/(^\d+)/)?.[1],
        template: fs.existsSync(__dirname + "/" + item + "/template.zip"),
        icons: fs.readdirSync(__dirname + `/${item}`).filter((item) => {
          return item.match(/^icon/);
        }),
      };
    }
  })
  .filter(Boolean);

fs.writeFileSync(
  __dirname + "/all.json",
  JSON.stringify(all.sort((a, b) => a.index - b.index))
);
