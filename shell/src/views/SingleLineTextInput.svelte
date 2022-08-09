<script lang="ts">
  import {View, SingleLineTextInput} from "./viewTypes";
  import {onMount} from "svelte";

  export let view:View & SingleLineTextInput;

  let input:HTMLInputElement;

  onMount(() => {
    if (view.params.autoFocus) {
      setTimeout(() =>  input ? input.focus() : null, 10);
    }
  })
</script>
<div>
    <input class="w-full input input-lg input-bordered"
           autocomplete="{view.params.autocomplete}"
           type="text"
           placeholder="{view.params.placeholder}"
           class:input-error={view.error}
           bind:value={view.params.value}
           bind:this="{input}"
           on:focus
           on:blur />
</div>