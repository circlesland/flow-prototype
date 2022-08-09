<script context="module" lang="ts">
  import "./shared/css/tailwind.css";
</script>

<script lang="ts">
  import WindowManager from "./process/WindowManager.svelte";
  import {updatePerson} from "./dapps/passport/processes/updatePerson";
  import {updateAvatar} from "./dapps/passport/processes/updateAvatar";
  import {updateCity} from "./dapps/passport/processes/updateCity";
  import {updateName} from "./dapps/passport/processes/updateName";
  import Taskbar from "./process/Taskbar.svelte";
  import {launcher} from "./dapps/launcher/processes/launcher";
  import {IProcessManifest, ProcessHost} from "./process/processHost";
  import {selectProfile} from "./dapps/passport/processes/selectProfile";
  import {connectSafe} from "./dapps/passport/processes/connectSafe";
  import {connectEoa} from "./dapps/passport/processes/connectEoa";
  import {selectSafe} from "./dapps/passport/processes/selectSafe";
  import {addNewSafeOwner} from "./dapps/passport/processes/addNewSafeOwner";
  import {switchProfile} from "./dapps/passport/processes/switchProfile";

  ProcessHost.instance.register(<IProcessManifest>{
    process: "launcher",
    segment: "launcher",
    icon: "play",
    name: "Launcher",
    description: "Overview of all available processes",
    factory: launcher
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "switchProfile",
    segment: "switchProfile",
    icon: "play",
    name: "Switch profile",
    description: "Switch to a different profile",
    factory: switchProfile
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "updatePerson",
    segment: "updatePerson",
    name: "Update profile",
    description: "Updates an existing profile",
    factory: updatePerson
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "updatePerson",
    segment: "selectProfile",
    name: "Select profile",
    icon: "user",
    description: "Selects a profile",
    factory: selectProfile
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "updatePerson",
    segment: "updateName",
    name: "Update name",
    icon: "pencil",
    description: "Updates only the name of a profile",
    factory: updateName
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "updatePerson",
    segment: "updateCity",
    name: "Update city",
    icon: "map",
    description: "Updates only the city of a profile",
    factory: updateCity
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "updatePerson",
    segment: "updateAvatar",
    name: "Update avatar",
    icon: "user-circle",
    description: "Updates only the avatar of a profile",
    factory: updateAvatar
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "connectSafe",
    segment: "connectSafe",
    name: "Connect safe to profile",
    description: "Connects an existing safe to an existing profile",
    factory: connectSafe
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "connectSafe",
    segment: "selectProfile",
    name: "Select profile",
    icon: "user",
    description: "Selects a profile",
    factory: selectProfile
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "connectSafe",
    segment: "connectEoa",
    name: "Import key",
    icon: "key",
    description: "Import an existing key",
    factory: connectEoa
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "connectSafe",
    segment: "selectSafe",
    name: "Select safe",
    description: "Select one of the key's safes",
    factory: selectSafe
  });
  ProcessHost.instance.register(<IProcessManifest>{
    process: "connectSafe",
    segment: "addNewSafeOwner",
    name: "Add new owner",
    icon: "user-add",
    description: "Adds a new owner to the selected safe",
    factory: addNewSafeOwner
  });
</script>
<svelte:window on:keydown={(e) => {
    if (e.altKey && e.key === "t") {
        ProcessHost.instance.run("launcher")
        e.preventDefault();
    }
}} />
<div class="flex flex-col h-screen justify-between">
    <header>
    </header>
    <main style="position: relative"
          class="mb-auto h-full w-full overflow-hidden">
        <WindowManager />
    </main>
    <footer style="z-index: 99999">
        <Taskbar />
    </footer>
</div>