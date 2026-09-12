<script setup lang="ts">
import { RTCSession } from 'jssip/lib/RTCSession';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { initVisualizer } from '../visualize';
import { getSessionById, getSessionTrunkById } from '../callSessionStore';
import { C } from 'jssip';
import { useSettingsStore } from '../stores/settingsStore';

const props = defineProps({
    id: { type: Number, required: true },
});

const settingsStore = useSettingsStore();

const state = ref('E');
const number = ref('');
const volume = ref(settingsStore.sessionInitialAudioVolume);
const onMute = ref(false);
const onHold = ref(false);

const session = getSessionById(props.id) as RTCSession;
const trunk = getSessionTrunkById(props.id);
const trunkColor = computed(() => settingsStore.getTrunkColor(trunk) || 'gray');

const updateDisplayedNumber = () => {
    number.value = session.remote_identity.uri.user;
};

if (session.direction === 'incoming') {
    state.value = 'I';
    updateDisplayedNumber();
} else {
    state.value = 'O';
    updateDisplayedNumber();

    session.connection.addEventListener('addstream', (e: any) => {
        console.log('local add stream');
        audio.value = audioStream();
        audio.value.srcObject = e.stream;
        initVisualizer(e.stream, vis.value);
        audio.value.play();
    });
}

session.on('progress', (): any => {
    console.log('progress');
    state.value = 'P';
    updateDisplayedNumber();
});

session.on('ended', () => {
    console.log('ended');
    state.value = 'E';
});

session.on('failed', (e: any) => {
    console.log('failed: ' + e.cause);

    const rejectedCauses = [C.causes.REJECTED, C.causes.CANCELED];
    const missedCauses = [C.causes.REQUEST_TIMEOUT, C.causes.NO_ANSWER, C.causes.BUSY];

    if (rejectedCauses.includes(e.cause)) {
        state.value = 'R';
    } else if (missedCauses.includes(e.cause)) {
        state.value = 'M';
    } else {
        state.value = 'F';
    }
});

session.on('accepted', () => {
    console.log('accepted');
    state.value = 'A';
    updateDisplayedNumber();
});

session.on('confirmed', () => {
    console.log('confirmed');
    state.value = 'C';
    updateDisplayedNumber();
});

session.on('peerconnection', (e: any) => {
    console.log('peerconnection');

    e.peerconnection.addEventListener('addstream', (e: any) => {
        console.log('remote add stream');
        audio.value = audioStream();
        audio.value.srcObject = e.stream;
        initVisualizer(e.stream, vis.value);
        audio.value.play();
    });
});

const emit = defineEmits(['delete']);

const vis = ref();
const audio = ref();
const parentDiv = ref();

const answer = () => {
    try {
        session.answer({
            mediaConstraints: {
                audio: true,
                video: false,
            },
        });
    } catch (e) {}
};

const reject = () => {
    try {
        session.terminate();
    } catch (e) {}
};

const toggleMute = () => {
    if (session.isMuted().audio) {
        session.unmute({ audio: true });
        onMute.value = false;
    } else {
        session.mute({ audio: true });
        onMute.value = true;
    }
};

const toggleHold = () => {
    if (session.isOnHold().local) {
        session.unhold({}, () => {
            onHold.value = session.isOnHold().local;
        });
    } else {
        session.hold({}, () => {
            onHold.value = session.isOnHold().local;
        });
    }
};

const sendDTMF = (num: string) => {
    if (state.value === 'C') {
        session.sendDTMF(num);
    }
};

const deleteSelf = () => {
    reject();
    emit('delete');
};

const focusIt = () => {
    if (parentDiv.value) {
        parentDiv.value.focus();
    }
};

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'a') {
        answer();
    } else if (e.key === 'r') {
        reject();
    } else if (e.key === 'm') {
        toggleMute();
    } else if (e.key === 'h') {
        toggleHold();
    } else if (e.key === 'd') {
        deleteSelf();
    } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'].includes(e.key)) {
        sendDTMF(e.key);
    }
};

const audioStream = () => {
    const audio = new Audio();
    audio.volume = Math.max(0, Math.min(1, volume.value / 100));

    return audio;
};

watch(volume, (val: number) => {
    if (audio.value) {
        audio.value.volume = Math.max(0, Math.min(1, val / 100));
    }
});

onMounted(() => {
    if (session.direction === 'outgoing') {
        focusIt();
    }
});

onBeforeUnmount(() => {
    delete audio.value;
});
</script>

<template>
    <div class="card" tabindex="0" ref="parentDiv" @click="focusIt" @keypress="handleKeyPress">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
            <p style="margin-right: 16px">{{ props.id }}</p>

            <div class="call-info">
                <p class="trunk">
                    <span class="trunk-swatch" :style="{ backgroundColor: trunkColor }"></span>
                    {{ trunk || 'unknown trunk' }}
                </p>
                <p class="num">{{ number }}</p>
            </div>

            <input
                class="vol-input"
                type="range"
                min="0"
                max="100"
                v-model.number="volume"
            />

            <canvas
                ref="vis"
                width="100"
                height="60"
            ></canvas>
        </div>

        <div
            v-if="settingsStore.showSessionControlButtons"
            style="display: flex; justify-content: space-between"
        >
            <div>
                <button :style="{ 'background-color': settingsStore.getStateColor(state) }">
                    {{ state }}
                </button>

                <button class="btn-green" @click="answer">
                    A
                </button>

                <button class="btn-red" @click="reject">
                    R
                </button>
            </div>

            <div>
                <button
                    :class="{ 'btn-red': onMute }"
                    @click="toggleMute"
                >
                    {{ onMute ? 'U' : 'M' }}
                </button>

                <button
                    :class="{ 'btn-red': onHold }"
                    @click="toggleHold"
                >
                    {{ onHold ? 'U' : 'H' }}
                </button>
            </div>

            <button
                class="btn-red"
                style="margin-left: 8px"
                @click="deleteSelf"
            >
                D
            </button>
        </div>

        <div v-else style="display: flex">
            <button
                style="width: 100%"
                :style="{ 'background-color': settingsStore.getStateColor(state) }"
            >
                {{ state }}
            </button>

            <button v-if="onMute" class="btn-red">
                M
            </button>

            <button v-if="onHold" class="btn-red">
                H
            </button>
        </div>
    </div>
</template>

<style scoped>
.card {
    padding: 16px;
    min-width: 96px;
}

.flex {
    display: flex;
}

.card:focus {
    outline: 2px solid cyan;
}

.call-info {
    flex: 1;
    min-width: 0;
}

.num {
    margin: 0;
    font-size: 1.2em;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.trunk {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1em;
    opacity: 0.8;
}

.trunk-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.6);
}

.vol-input {
    width: 56px;
    margin: 0 16px;
    padding: 0;
    border: 0;
}
</style>
