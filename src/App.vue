setitem
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import CallService from './callService';
import Session from './components/Session.vue';
import Settings from './components/Settings.vue';
import Instructions from './components/Instructions.vue';
import { callSessionIds, addSession, removeSessionById } from './callSessionStore';
import { useSettingsStore } from './stores/settingsStore';


const settingsStore = useSettingsStore();

const callService = new CallService();
const url = ref(settingsStore.connectionUrl);
const number = ref('01712345678');
const connected = ref(false);
callService.event.on('newRTCSession', ({ session, trunk }) => {
    // incoming calls may arrive on a trunk not configured yet
    if (trunk) settingsStore.addTrunk(trunk, true);
    addSession(session, trunk);
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
        });
    } catch (e) {
        alert('Invalid connection URL');
    }
};

const disconnect = () => {
    callService.end();
};

const call = (trunk: string) => {
    settingsStore.selectedTrunk = trunk;
    callService.newCall(number.value, trunk);
    number.value = settingsStore.getNextNumber(number.value);
};

const trunkPickerVisible = ref(false);
const callRow = ref<HTMLElement>();
const numberInput = ref<HTMLInputElement>();
const trunkPicker = ref<HTMLElement>();

const trunkOptions = () => Array.from(trunkPicker.value?.querySelectorAll('button') ?? []);

const openTrunkPicker = async () => {
    trunkPickerVisible.value = true;
    await nextTick();
    const options = trunkOptions();
    const idx = settingsStore.trunks.findIndex((t) => t.number === settingsStore.selectedTrunk);
    options[Math.max(0, idx)]?.focus();
};

const closeTrunkPicker = () => {
    trunkPickerVisible.value = false;
};

const pickTrunk = (trunk: string) => {
    closeTrunkPicker();
    call(trunk);
};

// moves focus to the adjacent item of a css grid, returns false if key is not an arrow
const focusGridNeighbor = (grid: HTMLElement, items: Element[], current: number, key: string) => {
    if (!key.startsWith('Arrow')) return false;
    // column count comes from the grid's css so it stays in sync with the layout
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    let next = -1;
    if (key === 'ArrowLeft' && current % columns !== 0) next = current - 1;
    else if (key === 'ArrowRight' && current % columns !== columns - 1) next = current + 1;
    else if (key === 'ArrowUp') next = current - columns;
    else if (key === 'ArrowDown') next = current + columns;
    if (next >= 0 && next < items.length) (items[next] as HTMLElement).focus();
    return true;
};

const handleTrunkPickerKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        closeTrunkPicker();
        nextTick(() => numberInput.value?.focus());
        return;
    }
    const options = trunkOptions();
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    if (trunkPicker.value && focusGridNeighbor(trunkPicker.value, options, current, e.key)) {
        e.preventDefault();
    }
};

const sessionsGrid = ref<HTMLElement>();

const deleteSession = async (id: number) => {
    const index = callSessionIds.value.indexOf(id);
    const hadFocus = sessionsGrid.value?.contains(document.activeElement) ?? false;
    removeSessionById(id);
    if (!hadFocus) return;
    await nextTick();
    // select whichever card took the deleted one's place, or the last one
    const cards = sessionsGrid.value?.children ?? [];
    (cards[Math.min(index, cards.length - 1)] as HTMLElement | undefined)?.focus();
};

const handleSessionsKey = (e: KeyboardEvent) => {
    const cards = Array.from(sessionsGrid.value?.children ?? []);
    // only when a card itself is focused, so arrows on its volume slider still work
    const current = cards.indexOf(e.target as Element);
    if (current === -1 || !sessionsGrid.value) return;
    if (focusGridNeighbor(sessionsGrid.value, cards, current, e.key)) e.preventDefault();
};

const closeTrunkPickerOnOutsideClick = (e: MouseEvent) => {
    if (trunkPickerVisible.value && !callRow.value?.contains(e.target as Node)) {
        closeTrunkPicker();
    }
};

onMounted(() => {
    document.addEventListener('mousedown', closeTrunkPickerOnOutsideClick);
    if (settingsStore.connectOnStartup) {
        connect();
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', closeTrunkPickerOnOutsideClick);
});
</script>

<template>
    <Instructions class="panel-left" />

    <div class="main">
        <div class="text-center">
            <h1>SIP Trunk Emulator</h1>
            <hr />
            <div style="width: 100%">
                <input type="text" v-model.trim="url" placeholder="ws(s)://host:port/ws" />
                <button v-if="!connected" class="btn-green" @click="connect" style="width: 140px">Connect</button>
                <button v-else class="btn-red" @click="disconnect" style="width: 140px">Disconnect</button>
            </div>
            <hr />
            <div v-if="connected" ref="callRow" class="call-row">
                <!-- hidden rather than removed so the page doesn't shift while picking -->
                <div :style="{ visibility: trunkPickerVisible ? 'hidden' : 'visible' }">
                    <input
                        ref="numberInput"
                        type="text"
                        v-model.trim="number"
                        placeholder="01712345678"
                        @keydown.enter.prevent="openTrunkPicker"
                    />
                    <button class="btn-blue" @click="openTrunkPicker" style="width: 140px">Call As</button>
                </div>
                <div v-if="trunkPickerVisible" ref="trunkPicker" class="trunk-picker" @keydown="handleTrunkPickerKey">
                    <button
                        v-for="(t, i) of settingsStore.trunks"
                        :key="i"
                        class="trunk-option"
                        @click="pickTrunk(t.number)"
                    >
                        <span class="trunk-swatch" :style="{ backgroundColor: t.color }"></span>
                        {{ t.number }}
                    </button>
                </div>
            </div>
            <hr v-if="connected" />
        </div>

        <div ref="sessionsGrid" class="sessions" @keydown="handleSessionsKey">
            <Session v-for="i in callSessionIds" :id="i" @delete="deleteSession(i)" :key="i" />
        </div>
    </div>

    <Settings class="panel-right" />
</template>

<style scoped>
.main {
    grid-column: 2;
    width: 1120px;
    margin-right: 16px;
    margin-left: 16px;
}

.panel-left {
    grid-column: 1;
    justify-self: start;
    padding-left: 16px;
}

.panel-right {
    grid-column: 3;
    justify-self: end;
    padding-right: 16px;
}

.text-center {
    text-align: center;
}

.call-row {
    position: relative;
    width: 100%;
}

.trunk-picker {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
    padding: 4px;
    border: 1px solid #646cff;
    border-radius: 8px;
    background-color: Canvas;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.trunk-option {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.trunk-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.6);
}

.sessions {
    display: grid;
    grid-template-columns: repeat(3, minmax(100px, 1fr));
    gap: 8px;
}
</style>
