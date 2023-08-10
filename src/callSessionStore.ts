import { RTCSession } from 'jssip/lib/RTCSession';
import { ref } from 'vue';

let id = 0;

interface SessionRecord {
    id: number;
    session: RTCSession;
}
export const callSessionIds = ref<number[]>([]);
const callSessions: SessionRecord[] = [];

export const addSession = (session: RTCSession) => {
    id++;
    callSessionIds.value.push(id);
    callSessions.push({ id: id, session });
    return id;
};

export const getSessionById = (id: number): RTCSession | null => {
    const session = callSessions.find((rec) => rec.id === id);
    if (session) {
        return session.session;
    }
    return null;
};

export const removeSessionById = (id: number) => {
    const index = callSessions.findIndex((rec) => rec.id === id);
    if (index !== -1) {
        callSessions.splice(index, 1);
    }

    const idIndex = callSessionIds.value.findIndex((rec) => rec === id);
    if (idIndex !== -1) {
        callSessionIds.value.splice(idIndex, 1);
    }
};
