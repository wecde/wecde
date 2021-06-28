<template>
  <div class="fill-height">
    <app-hammer>
      <v-spacer />

      <div class="d-flex">
        <v-tabs
          fixed-tabs
          background-color="transparent"
          class="tabs"
          v-model="tab"
        >
          <!-- <v-tabs-slider class="tab-slider"></v-tabs-slider> -->
          <v-tab class="primary--text">
            <v-icon>mdi-gitlab</v-icon>
          </v-tab>

          <v-tab class="primary--text">
            <v-icon>mdi-book-outline</v-icon>
          </v-tab>

          <v-tab class="primary--text">
            <v-icon>mdi-android-messages</v-icon>
          </v-tab>
        </v-tabs>
      </div>

      <v-spacer />
      <v-btn icon> </v-btn>
    </app-hammer>

    <div class="editor--wrapper">
      <div ref="editor" class="editor"></div>
    </div>
  </div>
</template>

<script>
import AppHammer from "@/components/AppHammer";
import ace from "ace-builds";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-emmet";
import "ace-builds/src-noconflict/ext-linking";
import "ace-builds/src-noconflict/ext-settings_menu";
import { beautify } from "ace-builds/src-noconflict/ext-beautify";
import codeLens from "ace-builds/src-noconflict/ext-code_lens";

let editor;

export default {
  components: {
    AppHammer,
  },
  data() {
    return {
      tab: null,
    };
  },
  methods: {
    beautify() {
      beautify.beautify(editor.session);
    },
  },
  mounted() {
    editor = ace.edit(this.$refs.editor);

    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
      enableBasicAutocompletion: true,
      // enableSnippets: true,
      enableLiveAutocompletion: true,
      enableLinking: true,
    });
    editor.setOption("enableEmmet", true);
    editor.setOption("enableCodeLens", true);

    codeLens.registerCodeLensProvider(editor, {
      provideCodeLenses(session, callback) {
        var p = [
          {
            start: { row: 0 },
            command: {
              id: "clearCodeLenses",
              title: "Clear all code lenses",
              arguments: [],
            },
          },
        ];
        var l = session.getLength();

        for (var row = 2; row < l; row++) {
          var line = session.getLine(row);
          var endColumn = line.length;

          var m = /[{>]\s*$/.exec(line);
          if (!m) continue;

          p.push({
            start: {
              row: row,
              column: m.index,
            },
            command: {
              id: "describeCodeLens",
              title: "Line " + (row + 1),
              arguments: ["line", row],
            },
          });

          if (m.index < 10) continue;
          p.push({
            start: {
              row: row,
              column: m.index,
            },
            end: {
              row: row,
              column: m.index + 1,
            },
            command: {
              id: "describeCodeLens",
              title: "column " + endColumn,
              arguments: ["column", endColumn],
            },
          });

          if (m.index < 30) continue;
          p.push({
            start: {
              row: row,
              column: m.index,
            },
            command: {
              id: "describeCodeLens",
              title: "Third Link",
              arguments: ["3", row],
            },
          });
        }
        callback(p);
      },
    });

    editor.session.mergeUndoDeltas = true;

    var staticWordCompleter = {
      getCompletions: function (editor, session, pos, prefix, callback) {
        var wordList = ["foo", "bar", "baz"];
        callback(null, [
          ...wordList.map(function (word) {
            return {
              caption: word,
              value: word,
              meta: "static",
            };
          }),
          ...session.$mode.$highlightRules.$keywordList.map(function (word) {
            return {
              caption: word,
              value: word,
              meta: "keyword",
            };
          }),
        ]);
      },
    };

    editor.completers = [staticWordCompleter];
  },
};
</script>

<style lang="scss" scoped>
.editor--wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  .editor {
    position: absolute;
    width: 100%;
    height: 100%;
  }
}
</style>
