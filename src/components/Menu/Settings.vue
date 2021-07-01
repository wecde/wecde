<template>
  <div class="fill-width fill-height">
    <div class="navigation--toolbar grey-2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> Settings </span>
      </div>

      <div>
        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="fill-height overflow-y-scroll">
      
    <v-list>
      <v-list-group prepend-icon="mdi-git" :value="true">
        <template v-slot:activator>
          <v-list-item-title>GIT</v-list-item-title>
        </template>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Credentials</v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <span class="primary--text"> Open </span>
          </v-list-item-action>
        </v-list-item>
      </v-list-group>

      <v-list-group
        :prepend-icon="stateGroup.icon"
        :value="true"
        v-for="stateGroup in stateDescription"
        :key="stateGroup.prop"
      >
        <template v-slot:activator>
          <v-list-item-title>{{ stateGroup.label }}</v-list-item-title>
        </template>

        <v-list-item
          v-for="state in stateGroup.props"
          :key="state.prop"
        >
          <v-list-item-content>
            <v-list-item-title> {{ state.label }} </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-switch inset small v-if="state.type === `switch`"></v-switch>
            <select v-else-if="state.type === `list`">
              <option
                v-for="item in state.select"
                :value="item.value"
                :key="item.value"
              >
                {{ item.label }}
              </option>
            </select>
          </v-list-item-action>
        </v-list-item>
      </v-list-group>
    </v-list>
    </div>
  </div>
</template>

<script>
import { stateDescription } from "@/store/modules/settings";

export default {
  data() {
    return {
      stateDescription,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";

select {
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
</style>
