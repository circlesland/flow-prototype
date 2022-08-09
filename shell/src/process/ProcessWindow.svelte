<script lang="ts">
  import {onMount} from "svelte";
  import {RuntimeProcess} from "./runtimeProcess";
  import {ProcessWindow} from "./processWindow";
  import {ProcessHost} from "./processHost";
  import {viewTypes} from "./WindowManager.svelte";
  import ProcessNavigation from "./ProcessNavigation.svelte";
  import {Readable} from "svelte/store";

  export let fullscreen: boolean = false;
  export let runtimeProcess: RuntimeProcess<any> | undefined = undefined;

  let windowElement: HTMLDivElement;
  let windowHeaderElement: HTMLDivElement;

  let processWindow: ProcessWindow;
  let delta: { x: number, y: number } = {x: 0, y: 0};

  let maximizeOnMouseUp: boolean = false;
  let state: Readable<any>|undefined = undefined;

  function onMouseUp() {
    processWindow.isMoving = false;
    processWindow.isMouseDown = false;
    delta = {x: 0, y: 0};
    if (maximizeOnMouseUp) {
      processWindow.maximize();
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (processWindow.isMoving) {
      runtimeProcess.processWindow.dimensions.x += e.movementX;
      runtimeProcess.processWindow.dimensions.y += e.movementY;
      windowElement.style.top = `${runtimeProcess.processWindow.dimensions.y}px`;
      windowElement.style.left = `${runtimeProcess.processWindow.dimensions.x}px`;

      maximizeOnMouseUp = runtimeProcess.processWindow.dimensions.y <= 8;
    }

    if (!processWindow.isMoving && processWindow.isMouseDown) {
      // The window is maximized and the user "pulls" on the title bar
      delta.x += e.movementX;
      delta.y += e.movementY;

      if (Math.abs(delta.x) > 8 || Math.abs(delta.y) > 8) {
        processWindow.float();
        processWindow.dimensions.x = windowElement.offsetLeft + delta.x;
        processWindow.dimensions.y = windowElement.offsetTop + delta.y;
        processWindow.isMoving = true;
      }
    }
  }

  function onMouseDown() {
    processWindow.isMoving = !fullscreen;
    processWindow.isMouseDown = true;
  }

  $: {
    if (runtimeProcess) {
      processWindow = runtimeProcess.processWindow;
      state = runtimeProcess.process.state;
    }
    if (processWindow) {
      if (processWindow.dimensions.y < 0) {
        processWindow.dimensions.y = 0;
      }
      if (processWindow.dimensions.x + processWindow.dimensions.w < 100) {
        processWindow.dimensions.x = processWindow.dimensions.w * -1 + 100;
      }
      if (processWindow.dimensions.x > window.innerWidth - 100) {
        processWindow.dimensions.x = window.innerWidth - 100;
      }
      if (processWindow.dimensions.y > window.innerHeight - 100) {
        processWindow.dimensions.y = window.innerHeight - 100;
      }
    }
  }

  onMount(() => {
    if (!fullscreen) {
      windowElement.style.position = 'absolute';
      windowElement.style.top = `${runtimeProcess.processWindow.dimensions.y}px`;
      windowElement.style.left = `${runtimeProcess.processWindow.dimensions.x}px`;
      windowElement.style.width = `${runtimeProcess.processWindow.dimensions.w}px`;
      windowElement.style.height = `${runtimeProcess.processWindow.dimensions.h}px`;
      windowElement.style.userSelect = 'none';
    }

    windowHeaderElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      windowHeaderElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
  });

  function onWindowKeyPress(e: KeyboardEvent) {
    if (!runtimeProcess)
      return;
    if (!runtimeProcess.processWindow.isFocused)
      return;

    const handled = runtimeProcess.processWindow.sendEvent({
      type: "keyPress",
      key: e.key,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey
    });

    if (handled)
      e.preventDefault();
  }

  const cancelPrompt = {
    type: "VerticalLayout",
    params: {
      overflow: "justify-evenly"
    },
    inner: [{
      type: "HorizontalLayout",
      params: {
        overflow: "justify-evenly"
      },
      inner: [{
        type: "Title",
        params: {
          text: "Do you really want to cancel?"
        }
      }]
    }, {
      type: "HorizontalLayout",
      params: {
        overflow: "justify-evenly"
      },
      inner: [{
        type: "Button",
        params: {
          cssClass: "btn btn-outline focus:btn-primary",
          text: "No",
          event: () => {
            return {
              type: "continue"
            }
          }
        }
      }, {
        type: "Button",
        params: {
          cssClass: "btn btn-outline focus:btn-primary",
          text: "Yes",
          event: () => {
            return {
              type: "cancel"
            }
          }
        }
      }]
    }]
  };
</script>

<svelte:window on:keydown={e => onWindowKeyPress(e)}/>
{#if runtimeProcess}
    {#if fullscreen}
        <div on:mousedown={() => !runtimeProcess.processWindow.isFocused ? ProcessHost.instance.focus(runtimeProcess.process.id) : undefined}
             class:bg-dark={runtimeProcess.processWindow.isFocused}
             class:bg-light={!runtimeProcess.processWindow.isFocused}
             bind:this={windowElement}
             class="w-full h-full overflow-y-auto overflow-x-auto flex items-start justify-start flex-col border dark:border-gray-800 rounded-lg bg-dark">
            <div class="w-full flex items-center justify-start relative p-1 border-b dark:border-gray-800">
                <div style="z-index: {runtimeProcess.processWindow.z * 100 + 1}"
                     class="p-1 flex items-center justify-center">
                    <div class="bg-red-500 m-1 w-3 h-3 rounded-full"
                         on:click={() => {runtimeProcess.processWindow.sendEvent({
                            type: "cancel"
                         })}}>
                    </div>
                    <div class="bg-yellow-500 m-1 w-3 h-3 rounded-full"
                         on:click={() => {runtimeProcess.processWindow.minimize()}}></div>
                    <div class="bg-green-500 m-1 w-3 h-3 rounded-full"
                         on:click={() => {runtimeProcess.processWindow.float()}}></div>
                </div>
                <div bind:this={windowHeaderElement}
                     on:dblclick={() => {runtimeProcess.processWindow.float()}}
                     class="w-full h-full flex items-center justify-center absolute left-0">
                <span class:text-white={runtimeProcess.processWindow.isFocused}
                      class:text-dark-lightest={!runtimeProcess.processWindow.isFocused}
                      class="font-sans text-xs">
                    <b>{runtimeProcess.processWindow.title}</b>
                </span>
                </div>
            </div>
            {#if processWindow}
                <div tabIndex="-1" class="bg-white block overflow-x-auto overflow-y-scroll h-full w-full">
                    {#if !processWindow.cancelRequested}
                        {#if $processWindow.navigation && $processWindow.navigation.canNavigate}
                            <ProcessNavigation runtimeProcess={runtimeProcess} navigation={$processWindow.navigation} />
                        {/if}
                        {#each $processWindow.views as view}
                            <svelte:component this={viewTypes[view.type]} runtimeProcess={runtimeProcess}
                                              view={view}/>
                        {/each}
                    {:else}
                        <svelte:component this={viewTypes.VerticalLayout} runtimeProcess={runtimeProcess}
                                          view={cancelPrompt}/>
                    {/if}
                </div>
            {/if}
        </div>
    {:else}
        <div style="z-index: {runtimeProcess.processWindow.z * 1000};"
             bind:this={windowElement}
             class="overflow-hidden"
             class:shadow-lg={runtimeProcess.processWindow.isFocused}>
            <div on:mousedown={() => !runtimeProcess.processWindow.isFocused ? ProcessHost.instance.focus(runtimeProcess.process.id) : undefined}
                 class="w-full flex items-start justify-start flex-col border dark:border-gray-800 rounded-lg"
                 class:bg-dark={runtimeProcess.processWindow.isFocused}
                 class:bg-light={!runtimeProcess.processWindow.isFocused}>
                <div class="w-full flex items-center justify-start relative p-1 border-b dark:border-gray-800">
                    <div style="z-index: {runtimeProcess.processWindow.z * 100 + 1}" class="p-1 flex items-center justify-center">
                        <div class="bg-red-500 m-1 w-3 h-3 rounded-full"
                             on:click={() => {runtimeProcess.processWindow.sendEvent({
                             type: "cancel"
                            })}}>
                        </div>
                        <div class="bg-yellow-500 m-1 w-3 h-3 rounded-full"
                             on:click={() => {runtimeProcess.processWindow.minimize()}}></div>
                        <div class="bg-green-500 m-1 w-3 h-3 rounded-full"
                             on:click={() => {runtimeProcess.processWindow.maximize()}}></div>
                    </div>
                    <div bind:this={windowHeaderElement}
                         on:dblclick={() => {runtimeProcess.processWindow.maximize()}}
                         class="w-full h-full flex items-center justify-center absolute left-0">
                    <span class:text-white={runtimeProcess.processWindow.isFocused}
                          class:text-dark-lightest={!runtimeProcess.processWindow.isFocused}
                          class="font-sans text-xs">
                        <b>{runtimeProcess.processWindow.title}</b>
                    </span>
                    </div>
                </div>
                {#if processWindow}
                <div class="bg-white overflow-x-auto overflow-y-scroll"
                     style="height: {processWindow.dimensions.h}px; width: {processWindow.dimensions.w}px">
                    {#if !processWindow.cancelRequested}
                        {#if $processWindow.navigation && $processWindow.navigation.canNavigate}
                            <ProcessNavigation runtimeProcess={runtimeProcess} navigation={$processWindow.navigation} />
                        {/if}
                        <div tabindex="-1">
                            {#each $processWindow.views as view}
                                <svelte:component this={viewTypes[view.type]} runtimeProcess={runtimeProcess} view={view}/>
                            {/each}
                        </div>
                    {:else}
                        <svelte:component this={viewTypes.VerticalLayout} runtimeProcess={runtimeProcess} view={cancelPrompt}/>
                    {/if}
                </div>
                {/if}
            </div>
        </div>
    {/if}
{/if}