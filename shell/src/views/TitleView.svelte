<script lang="ts">
  import {Title, View} from "./viewTypes";

  export let view:View & Title;
</script>
<h1 class="{view.params.cssClass}">{view.params.text}</h1>