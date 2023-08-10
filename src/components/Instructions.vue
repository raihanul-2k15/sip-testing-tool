setitem
<script setup lang="ts"></script>

<template>
    <div style="max-width: 320px">
        <div>
            <h3>Instructions</h3>

            <p>How to use</p>
            <ul>
                <li>Obtain a token for temporary use</li>
                <li>Or configure username, password and header in Settings for permanent use</li>
                <li>Use token or URL to connect to server</li>
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
