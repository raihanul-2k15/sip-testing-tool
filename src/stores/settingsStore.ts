import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        startupConnectionUrl: 'ws://127.0.0.1:8088/ws',
        connectOnStartup: false,

        sipUsername: '',
        sipPassword: '',
        sipHeaderKV: '',

        sessionInitialAudioVolume: 50.0,
        showSessionControlButtons: true,

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
    actions: {},
    persist: true,
});
