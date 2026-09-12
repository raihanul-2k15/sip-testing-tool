setitem
<script setup lang="ts">
import { useSettingsStore } from '../stores/settingsStore';

const settings = useSettingsStore();
</script>

<template>
    <div style="max-width: 320px">
        <div class="panel-header">
            <h3>Instructions</h3>
            <button class="panel-toggle" @click="settings.instructionsVisible = !settings.instructionsVisible">
                {{ settings.instructionsVisible ? 'Hide' : 'Show' }}
            </button>
        </div>
        <div v-show="settings.instructionsVisible">

            <p>How to use</p>
            <ul>
                <li>Configure username, password and outgoing trunks in Settings</li>
                <li>Use URL to connect to server</li>
                <li>Press Call As, then pick the outgoing trunk</li>
                <li>Make multiple simultaneous calls</li>
                <li>Highlight a session by clicking on it</li>
                <li>Perform actions on session by keyboard shortcuts</li>
                <li>Explore settings for some convenience</li>
            </ul>

            <p>Keyboard Shortcuts</p>
            <ul>
                <li>A - Accept incoming call</li>
                <li>R - End / Reject call</li>
                <li>M - Mute ongoing call</li>
                <li>H - Hold ongoing call</li>
                <li>D - End / Reject call and delete session</li>
                <li>0-9 - Send DTMF</li>
                <li>Arrow keys - Select adjacent session</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.side {
}

.text-center {
    text-align: center;
}
</style>
