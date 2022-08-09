<script lang="ts">
  import {viewTypes} from "../process/WindowManager.svelte";
  import {VerticalLayout, View} from "./viewTypes";
  import {RuntimeProcess} from "../process/runtimeProcess";

  export let view:View & VerticalLayout;
  export let runtimeProcess: RuntimeProcess<any>;
</script>

<div class="bg-white">
    {#each view.inner as innerView}
        <div class="{view.params && view.params.cssClass ? view.params.cssClass : ''}">
            <svelte:component this={viewTypes[innerView.type]} runtimeProcess={runtimeProcess} view={innerView} />
        </div>
    {/each}
</div>