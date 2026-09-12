setitem
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CallService from './callService';
import Session from './components/Session.vue';
import Settings from './components/Settings.vue';
import Instructions from './components/Instructions.vue';
import { callSessionIds, addSession, removeSessionById } from './callSessionStore';
import { useSettingsStore } from './stores/settingsStore';

const instructionsVisible = ref(false);
const settingsVisible = ref(false);
const instructionsClick = () => {
    instructionsVisible.value = !instructionsVisible.value;
};
const settingsClick = () => {
    settingsVisible.value = !settingsVisible.value;
};

const settingsStore = useSettingsStore();

const callService = new CallService();
const url = ref(settingsStore.connectionUrl);
const number = ref('01712345678');
const connected = ref(false);
callService.event.on('newRTCSession', (e: any) => {
    addSession(e.session);
});
callService.event.on('connected', () => {});
callService.event.on('disconnected', () => {
    connected.value = false;
});
callService.event.on('registered', () => {
    connected.value = true;
});
callService.event.on('unregistered', () => {
    connected.value = false;
});
callService.event.on('registrationFailed', () => {
    connected.value = false;
});

const connect = () => {
    callService.end();
    try {
        callService.init({
            wsConUrl: url.value,
            username: settingsStore.sipUsername,
            password: settingsStore.sipPassword,
            emulatedSipTrunk: settingsStore.emulatedSipTrunk,
        });
    } catch (e) {
        alert('Invalid connection URL');
    }
};

const disconnect = () => {
    callService.end();
};

const call = () => {
    callService.newCall(number.value);
    number.value = settingsStore.getNextNumber(number.value);
};

onMounted(() => {
    if (settingsStore.connectOnStartup) {
        connect();
    }
});
</script>

<template>
    <Instructions v-if="instructionsVisible" />

    <div class="main">
        <div class="text-center">
            <div style="position: relative">
                <button style="position: absolute; top: 0; left: 0" @click="instructionsClick">Instructions</button>
                <h1>SIP Trunk Emulator</h1>
                <button style="position: absolute; top: 0; right: 0" @click="settingsClick">Settings</button>
            </div>
            <hr />
            <div style="width: 100%">
                <input type="text" v-model.trim="url" placeholder="ws(s)://host:port/ws" />
                <button v-if="!connected" class="btn-green" @click="connect" style="width: 140px">Connect</button>
                <button v-else class="btn-red" @click="disconnect" style="width: 140px">Disconnect</button>
            </div>
            <hr />
            <div v-if="connected" style="width: 100%">
                <input type="text" v-model.trim="number" placeholder="01712345678" @keydown.enter="call" />
                <button class="btn-blue" @click="call" style="width: 140px">Call As</button>
            </div>
            <hr v-if="connected" />
        </div>

        <div class="sessions">
            <Session v-for="i in callSessionIds" :id="i" @delete="removeSessionById(i)" :key="i" />
        </div>
    </div>

    <Settings v-if="settingsVisible" />
</template>

<style scoped>
.main {
    width: 800px;
    margin-right: 16px;
    margin-left: 16px;
}

.text-center {
    text-align: center;
}

.sessions {
    display: grid;
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    gap: 8px;
}
</style>
