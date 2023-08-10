<script setup lang="ts">
import { useSettingsStore } from '../stores/settingsStore';

const settings = useSettingsStore();
</script>

<template>
    <div class="side">
        <div>
            <h3>Settings</h3>

            <hr />

            <div class="form-group">
                <label for="">Startup connection URL</label>
                <input type="text" v-model="settings.startupConnectionUrl" placeholder="ws(s)://host:port/ws" />
            </div>
            <div class="form-check">
                <input type="checkbox" id="cos" v-model="settings.connectOnStartup" />
                <label for="cos">Auto connect on startup</label>
            </div>

            <hr />

            <div class="form-group">
                <label for="">SIP Username</label>
                <input type="password" v-model="settings.sipUsername" placeholder="" />
            </div>
            <div class="form-group">
                <label for="">SIP Password</label>
                <input type="password" v-model="settings.sipPassword" placeholder="" />
            </div>
            <div class="form-group">
                <label for="">SIP HeaderKV</label>
                <input type="password" v-model="settings.sipHeaderKV" placeholder="" />
            </div>

            <hr />

            <div class="form-group">
                <label for="">Session initial audio volume</label>
                <input
                    class="vol-input"
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="settings.sessionInitialAudioVolume"
                />
            </div>
            <div class="form-check">
                <input type="checkbox" id="sscb" v-model="settings.showSessionControlButtons" />
                <label for="sscb">Show session control buttons</label>
            </div>

            <hr />

            <div class="form-check">
                <input type="checkbox" id="inac" v-model="settings.incrementNumberAfterCall" />
                <label for="inac">Increment number after call</label>
            </div>
            <div class="form-group">
                <label for="">Number to incrememnt by</label>
                <input type="text" v-model="settings.numberToIncrementBy" placeholder="0,1,2" />
            </div>

            <hr />

            <div class="form-check">
                <input type="checkbox" id="rnac" v-model="settings.randomizeNumberAfterCall" />
                <label for="rnac">Randomize number after call</label>
            </div>
            <div class="form-group">
                <label for="">Digit positions to randomize</label>
                <input type="text" v-model="settings.digitPositionsToRandomize" placeholder="2,3,-2,-1" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.side {
}

.text-center {
    text-align: center;
}

.form-group {
    display: flex;
    flex-flow: column;
    margin-bottom: 16px;
}

.form-check {
    margin-bottom: 16px;
}
.vol-input {
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
}
</style>
