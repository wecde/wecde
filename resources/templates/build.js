const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const md5 = require("md5-dir/promise");
const { zip } = require("zip-a-folder");

const ROOT_PATH = __dirname;

function existsFile(uri) {
  return new Promise((resolve, reject) => {
    if (/^https?:\/\//.test(uri)) {
      resolve(true);
    } else {
      fs.lstat(uri, (err, stat) => {
        if (err) {
          resolve(false);
        } else {
          resolve(stat.isFile());
        }
      });
    }
  });
}

function parse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

async function fixTemplate(template) {
  const uriRelease = path.join(template, "Release.json");

  const directoryName = path.basename(template);
  const ReleaseJSONFile = (await existsFile(uriRelease))
    ? parse(fs.readFileSync(uriRelease, "utf8"))
    : {};
  const Release = {
    ...ReleaseJSONFile,
  };

  Release.name = directoryName;
  Release["directory-name"] = directoryName;
  Release.images = [];
  Release.icons = [];

  fs.readdirSync(template).forEach((filename) => {
    if (
      /^image_/.test(filename) &&
      fs.lstatSync(path.join(template, filename)).isFile()
    ) {
      Release.images.push(
        path.relative(template, path.join(template, filename))
      );
    }

    if (
      /^icon_/.test(filename) &&
      fs.lstatSync(path.join(template, filename)).isFile()
    ) {
      Release.icons.push(
        path.relative(template, path.join(template, filename))
      );
    }
  });

  if (Release.images.length === 0) {
    delete Release.images;
  }
  if (Release.icons.length === 0) {
    delete Release.icons;
  }

  const uriFolderTemplate = path.join(template, "template");

  if (
    fs.existsSync(uriFolderTemplate) &&
    fs.statSync(uriFolderTemplate).isDirectory()
  ) {
    const md5FolderTemplate = await md5(uriFolderTemplate);
    const uriTemplateZip = path.join(template, "template.zip");

    Release.isTemplate = true;

    Release.MD5 = md5FolderTemplate;
    if (md5FolderTemplate !== ReleaseJSONFile.MD5) {
      console.info(`${template}: creating template.zip`);
      await zip(uriFolderTemplate, uriTemplateZip);
    }

    const stat = fs.lstatSync(uriTemplateZip);
    Release.mtimeMs = stat.mtimeMs;
  } else {
    Release.isTemplate = false;
  }

  if (JSON.stringify(Release) !== JSON.stringify(ReleaseJSONFile)) {
    fs.writeFileSync(uriRelease, JSON.stringify(Release, undefined, "  "));
    console.log(chalk.green(`${template}: Saved Release.json`));
  }

  return Release;
}

async function build() {
  const sort = [
    ...new Set(
      fs.existsSync(path.join(__dirname, "sort.txt"))
        ? fs
            .readFileSync(path.join(__dirname, "sort.txt"), "utf8")
            .split("\n")
            .map((item) => item.trim())
        : []
    ),
  ];

  const templates = (
    await Promise.all(
      fs.readdirSync(ROOT_PATH).map(async (template) => {
        template = path.join(ROOT_PATH, template);

        if (fs.lstatSync(template).isDirectory()) {
          return await fixTemplate(template);
        }
      })
    )
  ).filter(Boolean);

  const templatesSorted = [];
  const newSort = [];

  sort.forEach((item) => {
    const exitst = templates.findIndex((template) => template.name === item);

    if (exitst > -1) {
      newSort.push(item);
      templatesSorted.push(templates.splice(exitst, 1)[0]);
    }
  });

  const templateNotSort = templates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  templatesSorted.push(...templateNotSort);
  newSort.push(...templateNotSort.map((item) => item.name));

  if (sort.join("\n") !== newSort.join("\n")) {
    fs.writeFileSync(path.join(__dirname, "sort.txt"), newSort.join("\n"));
    console.log(chalk.green(`Saved sort.txt`));
  }

  const uriReleaseJson = path.join(__dirname, "Release.json");
  const oldRelease = fs.existsSync(uriReleaseJson)
    ? parse(fs.readFileSync(uriReleaseJson, "utf8"))
    : {};

  if (JSON.stringify(oldRelease) !== JSON.stringify(templatesSorted)) {
    fs.writeFileSync(
      uriReleaseJson,
      JSON.stringify(templatesSorted, undefined, "  ")
    );
    console.log(chalk.green(`Saved Release.json`));
  }
}

build();
