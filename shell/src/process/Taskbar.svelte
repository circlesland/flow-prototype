<script lang="ts">
  import {viewTypes, processesById} from "./WindowManager.svelte";
  import {Button} from "../views/viewTypes";
  import {RuntimeProcess} from "./runtimeProcess";
  import {ProcessHost} from "./processHost";

  let taskBar: any;
  $: {
    if ($processesById) {
      taskBar = {
        type: "HorizontalLayout",
        params: {
          overflow: "scroll"
        },
        inner: [<Button>{
          type: "Button",
          params: {
            text: "+",
            cssClass: `px-3 h-8 btn-block`,
            event: () => {
              ProcessHost.instance.run("launcher");
              return {type: "nop"};
            }
          }
        }].concat($processesById.map((o:RuntimeProcess<any>) => {
          return <Button>{
            type: "Button",
            params: {
              text: `${o.processWindow.title}`,
              cssClass: o.processWindow.isFocused ? `px-3 h-8 btn-block btn-primary` : `px-3 h-8 btn-block btn-light`,
              event: (processId) => {
                ProcessHost.instance.focus(o.process.id);
                return {type: "nop"};
              }
            }
          }
        }))
      };
    }
  }
</script>
<svelte:component this={viewTypes.HorizontalLayout} view={taskBar}/>