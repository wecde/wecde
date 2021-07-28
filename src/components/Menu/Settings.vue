<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("Settings") }}</template>

    <template v-slot:contents>
      <div class="list">
        <App-Collapse eager class="list--group">
          <template v-slot:activator="{ on, state }">
            <div class="list-action" v-on="on">
              <v-icon>{{ state ? mdiChevronDown : mdiChevronRight }}</v-icon>
              {{ $t("GIT") }}
            </div>
          </template>

          <div class="list-item">
            <div class="left">{{ $t("Credentials") }}</div>
            <div class="right">
              <Git-Provide>
                <span
                  slot="activator"
                  slot-scope="{ on, attr }"
                  v-on="on"
                  v-bind="attr"
                  class="primary--text"
                >
                  {{ $t("Open") }}
                </span>
              </Git-Provide>
            </div>
          </div>
        </App-Collapse>

        <App-Collapse
          eager
          class="list-group mt-3"
          v-for="stateGroup in stateDescription"
          :key="stateGroup.prop"
        >
          <template v-slot:activator="{ on, state }">
            <div class="list-action" v-on="on">
              <v-icon>{{ state ? mdiChevronDown : mdiChevronRight }}</v-icon>
              {{ $t(stateGroup.label) }}
            </div>
          </template>

          <template v-for="state in stateGroup.props">
            <div class="list-item" :key="state.prop">
              <div class="left">{{ $t(state.label) }}</div>
              <div class="right">
                <template v-if="state.list">
                  <select
                    :value="
                      $store.state.settings[stateGroup.prop + '__' + state.prop]
                    "
                    @change="
                      $store.commit(`settings/setState`, {
                        prop: `${stateGroup.prop}/${state.prop}`,
                        value:
                          state.type === `string`
                            ? $event.target.value
                            : +$event.target.value,
                      })
                    "
                    :placeholder="state.default"
                  >
                    <option
                      v-for="item in state.list"
                      :value="item.value"
                      :key="item.value"
                    >
                      {{ $t(item.label) }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  <v-switch
                    inset
                    small
                    v-if="state.type === `boolean`"
                    hide-details
                    class="mt-0"
                    :input-value="
                      $store.state.settings[stateGroup.prop + '__' + state.prop]
                    "
                    @change="
                      $store.commit(`settings/setState`, {
                        prop: `${stateGroup.prop}/${state.prop}`,
                        value: $event,
                      })
                    "
                  />
                  <input
                    v-else-if="state.type === `int`"
                    type="tel"
                    :value="
                      $store.state.settings[stateGroup.prop + '__' + state.prop]
                    "
                    :placeholder="state.default"
                    @input="
                      $store.commit(`settings/setState`, {
                        prop: `${stateGroup.prop}/${state.prop}`,
                        value: +$event.target.value,
                      })
                    "
                  />
                  <input
                    v-else
                    :type="state.type"
                    :value="
                      $store.state.settings[stateGroup.prop + '__' + state.prop]
                    "
                    :placeholder="state.default"
                    @input="
                      $store.commit(`settings/setState`, {
                        prop: `${stateGroup.prop}/${state.prop}`,
                        value: +$event.target.value,
                      })
                    "
                  />
                </template>
              </div>
            </div>
          </template>
        </App-Collapse>
      </div>
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import TemplateTab from "./template/Tab.vue";
import { stateDescription } from "@/store/modules/settings";
import AppCollapse from "@/components/App/Collapse.vue";
import GitProvide from "@/components/Git/ModalGitProvide.vue";
import { mdiChevronDown, mdiChevronRight, mdiClose } from "@mdi/js";

export default defineComponent({
  components: {
    TemplateTab,
    AppCollapse,
    GitProvide,
  },
  setup() {
    const stateDevTools = computed<boolean>({
      get() {
        return (self as any).__ERUDA__ || false;
      },
      set(value) {
        (self as any).setConsoleState(value);
      },
    });

    return {
      mdiChevronDown,
      mdiChevronRight,
      mdiClose,

      stateDescription,
      stateDevTools,
    };
  },
});
</script>

<style lang="scss" scoped>
select,
input {
  margin: 0;
  border-radius: 0;
  font: inherit;
  vertical-align: middle;
  outline: 0;
  border: 0;
  text-transform: none;
  appearance: none;
  user-select: none;
  padding: 4px 24px 4px 8px;
  border-bottom: solid 1px #e3e7f1;
  color: #5eaeff;
  border-color: rgba(79, 81, 84, 0.8);
  background: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2224%22%20height%3D%2212%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%3Cpolyline%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%221.0%22%20points%3D%2216%207%2010%2013%204%207%22%20%2F%3E%0A%3C%2Fsvg%3E%0A")
    no-repeat 100% 50%;
  max-width: 120px;
}

input {
  background: transparent;
}
input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
input[type="date"] {
  padding-right: 0;
}

.list {
  margin: 0 15px;

  &-action {
    line-height: 28pt;
    height: 38px;
    color: rgb(211, 212, 218);
    font-weight: 600;
  }
  &-item {
    color: rgb(211, 212, 218);
    font-weight: 400;
    margin-top: 3px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 10px 0;
    margin: 8px 4px;
    > *:nth-child(1) {
      max-width: (300px - 120px);
    }
    > *:nth-child(2) {
      max-width: 120px;
      word-break: break-all;
    }
  }
}
</style>
