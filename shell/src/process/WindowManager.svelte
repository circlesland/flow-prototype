<script lang="ts" context="module">
  import HorizontalLayout from "../views/HorizontalLayout.svelte";
  import VerticalLayout from "../views/VerticalLayout.svelte";
  import ButtonView from "../views/ButtonView.svelte";
  import TitleView from "../views/TitleView.svelte";
  import HtmlView from "../views/HtmlView.svelte";
  import AppList from "../views/AppList.svelte";
  import SingleLineTextInput from "../views/SingleLineTextInput.svelte";
  import MultiLineTextInput from "../views/MultiLineTextInput.svelte";
  import {ProcessHost} from "./processHost";

  export const viewTypes = {
    "HorizontalLayout": HorizontalLayout,
    "VerticalLayout": VerticalLayout,
    "Button": ButtonView,
    "Title": TitleView,
    "Html": HtmlView,
    "SingleLineTextInput": SingleLineTextInput,
    "MultiLineTextInput": MultiLineTextInput,
    "AppList": AppList
  }

  export const processesByZIndex = ProcessHost.instance.processesByZIndex;
  export const processesById = ProcessHost.instance.processesById;
  export const processLibrary = ProcessHost.instance.processesLibrary;
</script>
<script lang="ts">
  import {RuntimeProcess} from "./runtimeProcess";
  import {WindowState} from "./processWindow";
  import ProcessWindow from "./ProcessWindow.svelte";

  let topMostMaximizedWindow: RuntimeProcess<any> | undefined;
  let maximizedWindows: RuntimeProcess<any>[] = [];
  let floatingWindows: RuntimeProcess<any>[] = [];
  let floatingWindowsAboveMaximized: RuntimeProcess<any>[] = [];
  $: {
    maximizedWindows = $processesByZIndex.filter(o => o.processWindow.windowState === WindowState.Maximized);
    topMostMaximizedWindow = maximizedWindows.length > 0 ? maximizedWindows[maximizedWindows.length - 1] : undefined;

    floatingWindows = $processesByZIndex.filter(o => o.processWindow.windowState === WindowState.Floating);
    if (topMostMaximizedWindow) {
      floatingWindowsAboveMaximized = floatingWindows
        .filter(o => o.processWindow.z > topMostMaximizedWindow.processWindow.z);
    }
  }

  function setWindowOpenPosition(event:MouseEvent) {
    /*
    if (maximizedWindows.length > 0){
      return;
    }
    ProcessHost.instance.nextSpawnPosition = {
      x: event.clientX,
      y: event.clientY
    };
     */
  }
</script>
<div class="w-full h-full" on:click={setWindowOpenPosition}>
{#if topMostMaximizedWindow}
    <ProcessWindow fullscreen="true"
                   runtimeProcess={topMostMaximizedWindow}
                   context={{}}/>
    {#each floatingWindowsAboveMaximized as runtimeProcess(runtimeProcess.process.id)}
        <ProcessWindow runtimeProcess={runtimeProcess}
                       context={{}}/>
    {/each}
{:else}
    {#each floatingWindows as runtimeProcess(runtimeProcess.process.id)}
        <ProcessWindow runtimeProcess={runtimeProcess}
                       context={{}}/>
    {/each}
{/if}
</div>