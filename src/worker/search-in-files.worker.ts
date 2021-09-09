import type { FS } from "capacitor-fs";
import escapeRegExp from "escape-string-regexp";
import isBinaryPath from "is-binary-path-cross";
import minimatch from "minimatch";
import { basename, join } from "path-cross";
import { expose } from "workercom";

export type Result = {
  readonly fullpath: string;
  readonly pathOfProject: string;
  readonly basename: string;
  readonly match: readonly {
    readonly index: number;
    readonly firstValue: string;
    readonly value: string;
    readonly lastValue: string;
  }[];
};
export type SearchInFileRemoteInterface = {
  readonly search: typeof search;
  readonly searchInFile: typeof searchInFile;
};

const OFFSET_RESULT_SEARCH = 15;
async function searchInFile({
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
      const match = [...(rawMatch || [])].map((item) => {
        const indexSearch = item.index || 0;
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

        return {
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
        };
      });

      if (match.length > 0) {
        return {
          fullpath,
          pathOfProject: fullpath.split("/").slice(2).join("/"),
          basename: basename(fullpath),
          match,
        };
      }
    }
  }
}
async function search({
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

            // check include
            const veryInclude = include.every((test) =>
              minimatch(test, file, {
                dot: true,
              })
            );
            const veryExclude = exclude.every(
              (test) =>
                minimatch(test, file, {
                  dot: true,
                }) === false
            );
            // is ok
            if (veryInclude && veryExclude) {
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
        const result = await searchInFile({
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
}

expose({
  searchInFile,
  search,
});
