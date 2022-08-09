<script lang="ts">
  import {Button, View} from "./viewTypes";
  import {RuntimeProcess} from "../process/runtimeProcess";

  export let view: View & Button;
  export let runtimeProcess: RuntimeProcess<any>;
</script>
<div>
    <button class="{view.params.cssClass}" on:click={() => {
        if (typeof view.params.event === "function") {
            const result = view.params.event();
            if (result && runtimeProcess) {
              runtimeProcess.processWindow.sendEvent(result);
            }
        } else if (view.params.event && runtimeProcess) {
          runtimeProcess.processWindow.sendEvent(view.params.event);
        }
    }}>
        {view.params.text}
    </button>
</div>