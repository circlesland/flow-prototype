<script lang="ts">
  import {HorizontalLayout, View} from "./viewTypes";
  import {viewTypes} from "../process/WindowManager.svelte";
  import {RuntimeProcess} from "../process/runtimeProcess";

  export let view:View & HorizontalLayout;
  export let runtimeProcess: RuntimeProcess<any>;
</script>

<div class="flex flex-col bg-white">
    {#if !view.params || !view.params.overflow || view.params.overflow === "scroll"}
        <div class="flex overflow-x-auto hide-scroll-bar">
            <div class="flex flex-nowrap">
                {#each view.inner as innerView}
                    <div class="inline-block {view.params && view.params.cssClass ? view.params.cssClass : ''}">
                        <svelte:component this={viewTypes[innerView.type]} runtimeProcess={runtimeProcess} view={innerView}/>
                    </div>
                {/each}
            </div>
        </div>
    {:else if view.params.overflow === "wrap"}
        <div class="flex flex-wrap">
            {#each view.inner as innerView}
                <div class="inline-block {view.params && view.params.cssClass ? view.params.cssClass : ''}">
                    <svelte:component this={viewTypes[innerView.type]} runtimeProcess={runtimeProcess} view={innerView}/>
                </div>
            {/each}
        </div>
    {:else if view.params.overflow === "justify-evenly"}
        <div class="flex justify-evenly">
            {#each view.inner as innerView}
                <div class="inline-block {view.params && view.params.cssClass ? view.params.cssClass : ''}">
                    <svelte:component this={viewTypes[innerView.type]} runtimeProcess={runtimeProcess} view={innerView}/>
                </div>
            {/each}
        </div>
    {:else if view.params.overflow === "drop-down"}
        overflow mode "drop-down" is not implemented
    {/if}
</div>