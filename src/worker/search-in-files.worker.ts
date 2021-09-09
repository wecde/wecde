import type { FS } from "capacitor-fs";
import escapeRegExp from "escape-string-regexp";
import isBinaryPath from "is-binary-path-cross";
import minimatch from "minimatch";
import { basename, join, resolve } from "path-cross";
import { expose } from "workercom";

export type Result = {
  readonly fullpath: string;
  readonly pathOfProject: string;
  readonly regexp: string;
  readonly flags: string;
  readonly basename: string;
  readonly matches: readonly {
    readonly index: number;
    readonly firstValue: string;
    readonly value: string;
    readonly lastValue: string;
  }[];
};
export type SearchInFileRemoteInterface = ReturnType<typeof methods>;

function isParentFolder(parent: string, children: string): boolean {
  parent = resolve(parent);
  children = resolve(children);
  const pathsA = parent.split("/");
  const pathsB = children.split("/");
  return (
    pathEquals(parent, children) === false &&
    pathsA.every((value, index) => value === pathsB[index])
  );
}
function pathEquals(a: string, b: string): boolean {
  return resolve(a) === resolve(b);
}

function matchCheck(path: string, pattern: string): boolean {
  if (pathEquals(pattern, path) || isParentFolder(pattern, path)) {
    return true;
  }

  if (pattern.endsWith("/")) {
    // e.x: src/, src/**/
    pattern += "**"; // e.x: src/**, src/**/**
  }

  if (/^\.[^\/\\]+$/.test(pattern)) {
    if (matchCheck(path, `**${pattern}`)) {
      return true;
    }
  }

  return minimatch(path, pattern, {
    dot: true,
  });
}

const OFFSET_RESULT_SEARCH = 15;

function methods() {
  return {
    async searchInFile({
      fs,
      fullpath,
      keyword,
      useRegexp,
      useWordbox,
      useLetterCase,
    }: {
      readonly fs: FS;
      readonly fullpath: string;
      readonly keyword: string;
      readonly useRegexp: boolean;
      readonly useWordbox: boolean;
      readonly useLetterCase: boolean;
    }): Promise<Result | void> {
      if (isBinaryPath(fullpath) === false) {
        if (useRegexp === false) {
          keyword = escapeRegExp(keyword);
        }

        const regexp = new RegExp(
          `(?:(${keyword})${useWordbox ? "\\s|$" : ""}){1}?`,
          `g${useLetterCase ? "" : "i"}`
        );
        const textContentFile = await fs.readFile(fullpath, "utf8");
        const rawMatch = textContentFile.matchAll(regexp);

        if (rawMatch) {
          // eslint-disable-next-line functional/prefer-readonly-type
          const matches: [...Result["matches"]] = [];
          // eslint-disable-next-line functional/no-loop-statement
          for await (const item of rawMatch) {
            const indexSearch = item.index || -1;

            const indexNewlineBeforeSearch = textContentFile.lastIndexOf(
              "\n",
              indexSearch - 1
            );
            const indexNewLineAfterSearch = textContentFile.indexOf(
              "\n",
              indexSearch + 1 + item[1].length
            );

            const distIndexNewlineBeforeSearch =
              indexSearch - indexNewlineBeforeSearch;
            const distIndexNewlineAfterSearch =
              indexNewLineAfterSearch - (indexSearch + item[0].length);

            // eslint-disable-next-line functional/immutable-data
            matches.push({
              index: indexSearch,
              firstValue: textContentFile.substring(
                distIndexNewlineBeforeSearch < OFFSET_RESULT_SEARCH &&
                  indexNewlineBeforeSearch !== -1
                  ? indexNewlineBeforeSearch
                  : indexSearch - OFFSET_RESULT_SEARCH,
                indexSearch
              ),
              value: item[1],
              lastValue: textContentFile.substring(
                indexSearch + item[1].length,
                distIndexNewlineAfterSearch < OFFSET_RESULT_SEARCH &&
                  indexNewLineAfterSearch !== -1
                  ? indexNewLineAfterSearch
                  : indexSearch + item[1].length + OFFSET_RESULT_SEARCH
              ),
            });
          }

          if (matches.length > 0) {
            return {
              fullpath,
              pathOfProject: fullpath.split("/").slice(2).join("/"),
              regexp: regexp.toString(),
              flags: regexp.flags,
              basename: basename(fullpath),
              matches,
            };
          }
        }
      }
    },
    async search({
      fs,
      dir,
      keyword,
      useRegexp,
      useWordbox,
      useLetterCase,
      include,
      exclude,
      onProgress,
    }: {
      readonly fs: FS;
      readonly dir: string;
      readonly keyword: string;
      readonly useRegexp: boolean;
      readonly useWordbox: boolean;
      readonly useLetterCase: boolean;
      readonly include: string;
      readonly exclude: string;
      readonly onProgress: (rl: Result) => void;
    }): Promise<void> {
      if (keyword !== "") {
        async function globby(
          dirname: string,
          include: readonly string[],
          exclude: readonly string[],
          cb: (fullpath: string) => Promise<void>
        ): Promise<void> {
          await fs.readdir(join(dir, dirname)).then((files) => {
            return Promise.all(
              files.map(async (file) => {
                file = join(dirname, file);

                if (exclude.some((test) => matchCheck(file, test))) {
                  return;
                }

                // is ok
                if (
                  include.length === 0 ||
                  include.some((test) => matchCheck(file, test))
                ) {
                  // cont
                  const fullpath = join(dir, file);
                  if (await fs.isFile(fullpath)) {
                    await cb(fullpath);
                  } else {
                    await globby(file, include, exclude, cb);
                  }
                }
              })
            );
          });
        }

        await globby(
          "./",
          include
            .replace(/(?:\s)+,(?:\s)+/g, ",")
            .split(",")
            .filter(Boolean),
          [
            ".git",
            "node_modules",
            ...exclude
              .replace(/(?:\s)+,(?:\s)+/g, ",")
              .split(",")
              .filter(Boolean),
          ],
          async (fullpath: string): Promise<void> => {
            const result = await this.searchInFile({
              fs,
              fullpath,
              keyword,
              useRegexp,
              useWordbox,
              useLetterCase,
            });
            if (result) {
              onProgress(result);
            }
          }
        );
      }
    },
    async replaceInFile({
      fs,
      searchResult: { fullpath, regexp, flags },
      replaceValue,
    }: {
      readonly fs: FS;
      readonly searchResult: Result;
      readonly replaceValue: string;
    }): Promise<void> {
      // regexp;
      const context = await fs.readFile(fullpath, "utf8");

      const newContext = context.replace(
        new RegExp(regexp, flags),
        replaceValue
      );

      await fs.writeFile(fullpath, newContext, "utf8");
    },
    async replaceByMatch({
      fs,
      fullpath,
      regexp,
      flags,
      match: { index, value },
      replaceValue,
    }: {
      readonly fs: FS;
      readonly fullpath: string;
      readonly regexp: string;
      readonly flags: string;
      readonly match: Result["matches"][0];
      readonly replaceValue: string;
    }): Promise<void> {
      const context = await fs.readFile(fullpath, "utf8");

      const newContext =
        context.slice(0, index) +
        value.replaceAll(new RegExp(regexp, flags), replaceValue) +
        context.slice(index + value.length);

      await fs.writeFile(fullpath, newContext, "utf8");
    },
  };
}

expose(methods());
