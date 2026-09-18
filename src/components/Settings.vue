<script setup lang="ts">
import { ref } from 'vue';
import { MAX_TRUNKS, TrunkType, useSettingsStore } from '../stores/settingsStore';

const settings = useSettingsStore();

const newTrunk = ref('');
const newTrunkType = ref<TrunkType>('ip');
const addTrunk = () => {
    if (settings.addTrunk(newTrunk.value, false, newTrunkType.value)) newTrunk.value = '';
};
const renameTrunk = (index: number, e: Event) => {
    const input = e.target as HTMLInputElement;
    settings.renameTrunk(index, input.value);
    // show the stored value, reverting empty edits
    input.value = settings.trunks[index].number;
};
</script>

<template>
    <div class="side">
        <div class="panel-header">
            <h3>Settings</h3>
            <button class="panel-toggle" @click="settings.settingsVisible = !settings.settingsVisible">
                {{ settings.settingsVisible ? 'Hide' : 'Show' }}
            </button>
        </div>
        <div v-show="settings.settingsVisible">

            <hr />
            <div class="form-check">
                <input type="checkbox" id="cos" v-model="settings.connectOnStartup" />
                <label for="cos">Auto connect on startup</label>
            </div>

            <hr />

            <div class="form-group">
                <label for="">Connection URL</label>
                <input type="text" v-model="settings.connectionUrl" placeholder="ws(s)://host:port/ws" />
            </div>

            <div class="form-group">
                <label for="">SIP Username</label>
                <input type="text" v-model="settings.sipUsername" placeholder="" />
            </div>
            <div class="form-group">
                <label for="">SIP Password</label>
                <input type="password" v-model="settings.sipPassword" placeholder="" />
            </div>

            <hr />

            <div class="form-group">
                <label for="">Outgoing Trunks ({{ settings.trunks.length }}/{{ MAX_TRUNKS }})</label>
                <div v-for="(t, i) of settings.trunks" :key="i" class="trunk-row">
                    <span
                        class="trunk-swatch"
                        :style="{ backgroundColor: t.color }"
                        title="Click for another color"
                        @click="settings.recolorTrunk(i)"
                    ></span>
                    <input class="trunk-input" type="text" :value="t.number" @change="renameTrunk(i, $event)" />
                    <button
                        class="trunk-type"
                        :class="t.type === 'wa' ? 'btn-green' : 'btn-blue'"
                        :title="t.type === 'wa' ? 'WhatsApp trunk' : 'IPTSP trunk'"
                        @click="settings.toggleTrunkType(i)"
                    >
                        {{ t.type === 'wa' ? 'WA' : 'IP' }}
                    </button>
                    <button
                        class="btn-red"
                        :disabled="settings.trunks.length <= 1"
                        @click="settings.removeTrunk(i)"
                    >
                        X
                    </button>
                </div>
                <div class="trunk-row">
                    <input
                        class="trunk-input"
                        type="text"
                        v-model.trim="newTrunk"
                        placeholder="00000000000"
                        @keydown.enter="addTrunk"
                    />
                    <button
                        class="trunk-type"
                        :class="newTrunkType === 'wa' ? 'btn-green' : 'btn-blue'"
                        @click="newTrunkType = newTrunkType === 'wa' ? 'ip' : 'wa'"
                    >
                        {{ newTrunkType === 'wa' ? 'WA' : 'IP' }}
                    </button>
                    <button class="btn-green" :disabled="settings.trunks.length >= MAX_TRUNKS" @click="addTrunk">
                        Add
                    </button>
                </div>
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

            <hr />

            <div class="form-group">
                <button class="btn-red" style="width: 100%" @click="settings.resetToDefaults">
                    Reset All Settings To Defaults
                </button>
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
.trunk-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.trunk-swatch {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.6);
}

.trunk-type {
    width: 44px;
    flex-shrink: 0;
}

.trunk-input {
    flex: 1;
    min-width: 0;
}

.vol-input {
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
}
</style>
