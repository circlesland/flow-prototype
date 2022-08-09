<script lang="ts">
  import {processLibrary, processHost} from "../process/WindowManager.svelte";
  import Icon from "@krowten/svelte-heroicons/Icon.svelte";
  import {IProcessManifest, ProcessHost} from "../process/processHost";

  let apps: { [process: string]: IProcessManifest[] };
  $: {
    apps = $processLibrary.groupBy(o => o.process);
  }

  function run(processManifest:IProcessManifest, debug:boolean) {
    const key = processManifest.process == processManifest.segment
      ? `${processManifest.process}`
      :`${processManifest.process}|${processManifest.segment}`;

    ProcessHost.instance.run(key, undefined, debug);
  }
</script>
{#if apps}
    {#each Object.keys(apps) as app}
        <div class="w-full">
            <div class="m-4">
                <section on:click={(e) => run(apps[app][0], e.shiftKey)} class="flex cursor-pointer">
                    <div class="flex mr-2">
                        <Icon name={apps[app][0].icon ? apps[app][0].icon : "play"} style="color:green;" class="inline-block green w-6 h-6 heroicon"/>
                    </div>
                    <div class="cursor-pointer text-sm" >
                        <b>{apps[app][0].name}</b>
                        <p class="mb-2">{apps[app][0].description}</p>
                    </div>
                </section>
                <hr/>
            </div>
            <div class="m-4 mb-8">
                <div class="grid grid-cols-2 gap-4 text-base auto-rows-fr dashboard-grid lg:grid-cols-3">
                    {#each apps[app].filter(o => o.segment !== app) as process}
                        <section on:click={() => run(process)}
                                 class="flex items-center justify-center bg-white rounded-lg shadow-md cursor-pointer dashboard-card">
                            <div class="flex flex-col items-center p-4 pt-6 justify-items-center">
                                <Icon name={process.icon ? process.icon : "play"} class="inline-block w-6 h-6 heroicon"/>
                            </div>
                            <div class="cursor-pointer text-sm" >
                                {process.name}
                            </div>
                        </section>
                    {/each}
                </div>
            </div>
        </div>
    {/each}
{/if}