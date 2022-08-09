<script lang="ts">
  import {viewTypes, processHost, processesById} from "./WindowManager.svelte";
  import {RuntimeProcess} from "./runtimeProcess";
  import {HorizontalLayout, View} from "../views/viewTypes";
  import {NavigationInfo} from "./promptService";
  import {Readable} from "svelte/store";

  export let runtimeProcess: RuntimeProcess<any>;
  let state:Readable<any>|undefined = undefined;

  export let navigation: NavigationInfo;

  let processNavigation: (View & HorizontalLayout) | undefined = undefined;
  $:{
    console.log(runtimeProcess.process.service.state.historyValue);
    processNavigation = <View & HorizontalLayout>{
      type: "HorizontalLayout",
      params: {},
      inner: (navigation && navigation.canNavigate ? [{
        type: "Button",
        params: {
          cssClass: runtimeProcess && runtimeProcess.process.service.state.historyValue
            ? "h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
            : "h-8 px-4 m-2 text-sm rounded-lg btn-disabled",
          text: "<",
          event: () => {
            if (runtimeProcess && runtimeProcess.process.service.state.historyValue) {
              return {
                type: "back"
              }
            }
            return undefined;
          }
        }
      }] : [])
      .concat(navigation && navigation.canSkip ? [{
        type: "Button",
        params: {
          cssClass: "h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800",
          text: ">",
          event: () => {
            return {
              type: "skip"
            }
          }
        }
      }] : [])
    };
  }
</script>
{#if processNavigation && navigation && navigation.canNavigate}
    <div class="h-8">
    <svelte:component this={viewTypes.HorizontalLayout} runtimeProcess={runtimeProcess} view={processNavigation}/>
    </div>
{/if}