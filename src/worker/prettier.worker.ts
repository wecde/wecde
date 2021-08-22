/* eslint-env worker */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).window = self;

import {
  check,
  CursorOptions,
  CursorResult,
  FileInfoOptions,
  FileInfoResult,
  format,
  formatWithCursor,
  getFileInfo,
  Options,
} from "prettier";
import parserAngular from "prettier/parser-angular";
import parserBabel from "prettier/parser-babel";
import parserEspress from "prettier/parser-espree";
import parserFlow from "prettier/parser-flow";
import parserGraphql from "prettier/parser-graphql";
import parserHtml from "prettier/parser-html";
import parserMarkdown from "prettier/parser-markdown";
import parserMeriyah from "prettier/parser-meriyah";
import parserPostCss from "prettier/parser-postcss";
import parserTypescript from "prettier/parser-typescript";
import parserYaml from "prettier/parser-yaml";
import { expose } from "workercom";

export type PrettierRemoteInterface = {
  readonly format: (source: string, options: Options) => string;
  readonly formatWithCursor: (
    source: string,
    options: CursorOptions
  ) => CursorResult;
  readonly check: (source: string, options: Options) => boolean;
  readonly getFileInfo: (
    path: string,
    options?: FileInfoOptions
  ) => Promise<FileInfoResult>;
};

function callbacks(): PrettierRemoteInterface {
  return {
    format(source, options) {
      return format(source, {
        ...options,
        plugins: [
          parserAngular,
          parserBabel,
          parserEspress,
          parserFlow,
          parserGraphql,
          parserHtml,
          parserMarkdown,
          parserMeriyah,
          parserPostCss,
          parserTypescript,
          parserYaml,
        ],
      });
    },
    formatWithCursor(source, options) {
      return formatWithCursor(source, {
        ...options,
        plugins: [
          parserAngular,
          parserBabel,
          parserEspress,
          parserFlow,
          parserGraphql,
          parserHtml,
          parserMarkdown,
          parserMeriyah,
          parserPostCss,
          parserTypescript,
          parserYaml,
        ],
      });
    },
    check(source, options) {
      return check(source, {
        ...options,
        plugins: [
          parserAngular,
          parserBabel,
          parserEspress,
          parserFlow,
          parserGraphql,
          parserHtml,
          parserMarkdown,
          parserMeriyah,
          parserPostCss,
          parserTypescript,
          parserYaml,
        ],
      });
    },
    getFileInfo(path, options) {
      return getFileInfo(path, options);
    },
  };
}

expose(callbacks());
