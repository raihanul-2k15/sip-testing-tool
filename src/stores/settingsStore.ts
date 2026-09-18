import { defineStore } from 'pinia';

// iptsp or whatsapp trunk
export type TrunkType = 'ip' | 'wa';

export interface Trunk {
    number: string;
    color: string;
    type: TrunkType;
}

export const TRUNK_COLORS = [
    '#e6194b', // red
    '#3cb44b', // green
    '#4363d8', // blue
    '#f58231', // orange
    '#ffe119', // yellow
    '#ffffff', // white
    '#f032e6', // pink
    '#911eb4', // purple
];
export const MAX_TRUNKS = TRUNK_COLORS.length;
export const DEFAULT_TRUNK = '00000000000';

const randomRgbColor = () => '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');

// falls back to a fully random color once the palette is used up
const pickUnusedColor = (trunks: Trunk[]) => {
    const unused = TRUNK_COLORS.filter((c) => !trunks.some((t) => t.color === c));
    if (unused.length === 0) return randomRgbColor();
    return unused[Math.floor(Math.random() * unused.length)];
};

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        connectOnStartup: false,

        connectionUrl: 'ws://127.0.0.1:8088/ws',
        sipUsername: 'trunk-emulator',
        sipPassword: 'aaaaaa',

        trunks: [{ number: DEFAULT_TRUNK, color: pickUnusedColor([]), type: 'ip' }] as Trunk[],
        selectedTrunk: DEFAULT_TRUNK,

        sessionInitialAudioVolume: 100.0,
        showSessionControlButtons: true,

        instructionsVisible: true,
        settingsVisible: true,

        incrementNumberAfterCall: false,
        numberToIncrementBy: 111,

        randomizeNumberAfterCall: false,
        digitPositionsToRandomize: '',

        sessionStateColor: {
            I: 'blue',
            O: 'blue',
            P: 'yellow',
            E: 'black',
            R: 'red',
            M: 'red',
            F: 'red',
            A: 'green',
            C: 'violet',
        } as { [key: string]: string },
    }),
    getters: {
        getTrunkColor: (state) => (number: string) => {
            return state.trunks.find((t) => t.number === number)?.color;
        },
        getStateColor: (state) => (stateName: string) => {
            return state.sessionStateColor[stateName] || 'black';
        },
        getNextNumber: (state) => (number: string) => {
            if (state.incrementNumberAfterCall) {
                return (parseInt(number) + state.numberToIncrementBy).toString();
            }

            if (state.randomizeNumberAfterCall) {
                const digPositions = state.digitPositionsToRandomize
                    .split(',')
                    .map((p) => parseInt(p.trim()))
                    .filter((p) => !isNaN(p) && isFinite(p));
                const digits = number.split('');
                digPositions.forEach((p) => {
                    if (p >= 0 && p < digits.length) {
                        digits[p] = Math.floor(Math.random() * 10).toString();
                    } else if (p < 0 && p >= -digits.length) {
                        digits[digits.length + p] = Math.floor(Math.random() * 10).toString();
                    }
                });
                return digits.join('');
            }

            return number;
        },
    },
    actions: {
        // incoming calls pass ignoreLimit so their trunk is always added
        addTrunk(number: string, ignoreLimit = false, type: TrunkType = 'ip') {
            number = number.trim();
            if (!number || (!ignoreLimit && this.trunks.length >= MAX_TRUNKS)) return false;
            if (this.trunks.some((t) => t.number === number)) return false;
            this.trunks.push({ number, color: pickUnusedColor(this.trunks), type });
            return true;
        },
        toggleTrunkType(index: number) {
            const trunk = this.trunks[index];
            if (trunk) trunk.type = trunk.type === 'wa' ? 'ip' : 'wa';
        },
        renameTrunk(index: number, number: string) {
            number = number.trim();
            const trunk = this.trunks[index];
            if (!trunk || !number) return false;
            if (this.selectedTrunk === trunk.number) this.selectedTrunk = number;
            trunk.number = number;
            return true;
        },
        recolorTrunk(index: number) {
            const trunk = this.trunks[index];
            // excludes this trunk's own color too, so it always changes
            if (trunk) trunk.color = pickUnusedColor(this.trunks);
        },
        removeTrunk(index: number) {
            if (this.trunks.length <= 1) return;
            this.trunks.splice(index, 1);
            if (!this.trunks.some((t) => t.number === this.selectedTrunk)) {
                this.selectedTrunk = this.trunks[0].number;
            }
        },
        resetToDefaults() {
            if (!confirm('Reset all settings to defaults?')) return;
            this.$reset();
        },
    },
    persist: {
        // trunks saved before the type attribute existed default to ip
        afterRestore: (ctx) => {
            ctx.store.trunks.forEach((t: Trunk) => {
                if (t.type !== 'wa') t.type = 'ip';
            });
        },
    },
});
