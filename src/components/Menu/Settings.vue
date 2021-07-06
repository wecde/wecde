<template>
  <div class="fill-width fill-height">
    <div class="navigation--toolbar grey-2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> {{ $t("Settings") }} </span>
      </div>

      <div>
        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="fill-height overflow-y-scroll">
      <div class="list">
        <app-collapse eager class="list--group">
          <template v-slot:activator="{ on, state }">
            <div class="list-action" v-on="on">
              <v-icon>{{
                state ? "mdi-chevron-down" : "mdi-chevron-right"
              }}</v-icon>
              GIT
            </div>
          </template>

          <div class="list-item">
            <div class="left">{{ $t("Credentials") }}</div>
            <div class="right">
              <span class="primary--text"> {{ $t("Open") }} </span>
            </div>
          </div>
        </app-collapse>

        <app-collapse
          eager
          class="list-group mt-3"
          v-for="stateGroup in stateDescription"
          :key="stateGroup.prop"
        >
          <template v-slot:activator="{ on, state }">
            <div class="list-action" v-on="on">
              <v-icon>{{
                state ? "mdi-chevron-down" : "mdi-chevron-right"
              }}</v-icon>
              {{ $t(stateGroup.label) }}
            </div>
          </template>

          <template v-for="state in stateGroup.props">
            <div class="list-item" :key="state.prop">
              <div class="left">{{ $t(state.label) }}</div>
              <div class="right">
                <v-switch
                  inset
                  small
                  v-if="state.type === `switch`"
                  hide-details
                  class="mt-0"
                  :input-value="
                    $store.state.settings[stateGroup.prop][state.prop]
                  "
                  @change="
                    $store.commit(`settings/setState`, {
                      prop: `${stateGroup.prop}.${state.prop}`,
                      value: $event,
                    })
                  "
                ></v-switch>
                <select
                  v-else-if="state.type === `list`"
                  :value="$store.state.settings[stateGroup.prop][state.prop]"
                  @change="
                    $store.commit(`settings/setState`, {
                      prop: `${stateGroup.prop}.${state.prop}`,
                      value: $event.target.value,
                    })
                  "
                >
                  <option
                    v-for="item in state.select"
                    :value="item.value"
                    :key="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
                <input
                  v-else
                  :type="state.type"
                  :value="$store.state.settings[stateGroup.prop][state.prop]"
                  @change="
                    $store.commit(`settings/setState`, {
                      prop: `${stateGroup.prop}.${state.prop}`,
                      value: $event.target.value,
                    })
                  "
                />
              </div>
            </div>
          </template>
        </app-collapse>

        <app-collapse eager class="list--group" v-if="device">
          <template v-slot:activator="{ on, state }">
            <div class="list-action" v-on="on">
              <v-icon>{{
                state ? "mdi-chevron-down" : "mdi-chevron-right"
              }}</v-icon>
              {{ $t("About") }}
            </div>
          </template>
          <div class="list-item">
            <div class="left">{{ device.name || $t("Device") }}</div>
            <div class="right">
              <span class="primary--text"> {{ device.osVersion }} </span>
            </div>
          </div>
          <div class="list-item">
            <div class="left">{{ $t("Platform") }}</div>
            <div class="right">
              <span class="primary--text text-capitalize">
                {{ device.platform }}
              </span>
            </div>
          </div>
          <div class="list-item">
            <div class="left">{{ $t("OS") }}</div>
            <div class="right">
              <span class="primary--text text-capitalize">
                {{ device.isVirtual ? "virtual ~ " : "" }}
                {{ device.operatingSystem }}({{ device.osVersion }})
              </span>
            </div>
          </div>
          <div class="list-item">
            <div class="left">{{ $t("Manufacturer") }}</div>
            <div class="right">
              <span class="primary--text text-capitalize">
                {{ device.manufacturer }}
              </span>
            </div>
          </div>
          <div class="list-item">
            <div class="left">{{ $t("WebView Version") }}</div>
            <div class="right">
              <span class="primary--text text-capitalize">
                {{ device.webViewVersion }}
              </span>
            </div>
          </div>
          <div class="list-item">
            <div>{{ $t("Disk Free") }}</div>
            <div>
              {{ size(device.diskFree || 0) }}({{
                (device.diskFree / device.diskTotal).toFixed(2)
              }}%)
            </div>
          </div>
          <div class="list-item">
            <div>{{ $t("Disk Used") }}</div>
            <div>
              {{ size(device.memUsed || 0) }}({{
                (device.memUsed / device.diskTotal).toFixed(2)
              }}%)
            </div>
          </div>
          <div class="list-item">
            <div>{{ $t("Disk Total") }}</div>
            <div>{{ size(device.diskTotal || 0) }}</div>
          </div>
          <div class="list-item">
            <div>{{ $t("UUID") }}</div>
            <div>{{ device.uuid.replace(/-/g, "") }}</div>
          </div>
        </app-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import { stateDescription } from "@/store/modules/settings";
import AppCollapse from "@/components/AppCollapse";
import { Device } from "@capacitor/device";
import filesize from "filesize";

export default defineComponent({
  components: {
    AppCollapse,
  },
  setup() {
    const device = ref(null);

    async function refreshInfoDevice() {
      const [{ uuid }, info] = await Promise.all([
        Device.getId(),
        Device.getInfo(),
      ]);

      device.value = {
        uuid,
        ...info,
      };
    }

    refreshInfoDevice();

    return {
      stateDescription,
      device,
      size: filesize.partial({
        standard: "iec",
      }),
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";

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
</style>
<style lang="scss" scoped>
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

    > *:nth-child(2) {
      max-width: 120px;
      word-break: break-all;
    }
  }
}
</style>
