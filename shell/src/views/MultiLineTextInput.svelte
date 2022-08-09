<script lang="ts">
  import {MultiLineTextInput, View} from "./viewTypes";
  import {onMount} from "svelte";

  export let view:View & MultiLineTextInput;

  let textArea:HTMLTextAreaElement;

  onMount(() => {
    if (view.params.autoFocus) {
      setTimeout(() =>  textArea ? textArea.focus() : null, 10);
    }
  })
</script>
<textarea bind:this={textArea} bind:value={view.params.value}></textarea>