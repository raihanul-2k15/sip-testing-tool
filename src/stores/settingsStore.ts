import { defineStore } from 'pinia';
import { Profile, isSameProfile } from '../profile';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        connectOnStartup: false,

        profiles: [] as Profile[],
        currentProfileIndex: null as null | number,

        connectionUrl: 'ws://127.0.0.1:8088/ws',
        sipUsername: 'test-trunk-wss',
        sipPassword: 'aaaaaa',
        sipHeaderKV: 'TEST_TRUNK_ENDPOINT: true',
        sipExtension: 's',

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
    actions: {
        saveCurrentProfile() {
            const name = prompt('Profile name?');
            if (!name) return;
            const currentProfile = {
                connectionUrl: this.connectionUrl,
                sipUsername: this.sipUsername,
                sipPassword: this.sipPassword,
                sipHeaderKV: this.sipHeaderKV,
                sipExtension: this.sipExtension,
            };
            const idx = this.profiles.findIndex((p) => isSameProfile(p, currentProfile));
            if (idx != -1) {
                this.currentProfileIndex = idx;
                return;
            }
            this.profiles.push({
                name,
                connectionUrl: this.connectionUrl,
                sipUsername: this.sipUsername,
                sipPassword: this.sipPassword,
                sipHeaderKV: this.sipHeaderKV,
                sipExtension: this.sipExtension,
            });
            this.currentProfileIndex = this.profiles.length - 1;
        },
        applyCurrentProfile() {
            if (this.currentProfileIndex === null) return;
            const p = this.profiles[this.currentProfileIndex];
            this.connectionUrl = p.connectionUrl;
            this.sipUsername = p.sipUsername;
            this.sipPassword = p.sipPassword;
            this.sipHeaderKV = p.sipHeaderKV;
            this.sipExtension = p.sipExtension;
        },
        deleteCurrentProfile() {
            if (this.currentProfileIndex === null) return;
            if (!confirm(`Delete profile ${this.profiles[this.currentProfileIndex].name}?`)) return;
            this.profiles.splice(this.currentProfileIndex, 1);
            this.currentProfileIndex = null;
        },
        importNewProfiles() {
            const str = prompt('Paste exported profiles');
            if (!str) return;
            const given = JSON.parse(str);
            let cnt = 0;
            for (let g of given) {
                const idx = this.profiles.findIndex((p) => isSameProfile(p, g));
                if (idx == -1) {
                    this.profiles.push(g);
                    cnt++;
                }
            }
            alert(cnt + ' profiles imported!');
        },
        exportAllProfiles() {
            const str = JSON.stringify(this.profiles);
            navigator.clipboard.writeText(str);
            alert('Copied to clipboard!');
        },
    },
    persist: true,
});
