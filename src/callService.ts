import { UA, WebSocketInterface } from 'jssip';
import { RTCSession } from 'jssip/lib/RTCSession';
import { RTCSessionEvent, UAConfiguration } from 'jssip/lib/UA';
import mitt, { Emitter } from 'mitt';

interface ConnectConfig {
    wsConUrl: string;
    username: string;
    password: string;
}

const TRUNK_HEADER = 'X-TRUNK-TEST';

export default class CallService {
    public event: Emitter<{
        newRTCSession: { session: RTCSession; trunk: string };
        connected: any;
        disconnected: any;
        registered: any;
        unregistered: any;
        registrationFailed: any;
    }> = mitt();

    private phone: UA | null = null;
    private outgoingTrunk: string = '';
    private options = {
        mediaConstraints: { audio: true, video: false },
    };

    public init(config: ConnectConfig) {
        this.end();
        this.phone = new UA(this.getSipConfiguration(config));
        this.phone.on('connected', this.connectedHandler);
        this.phone.on('disconnected', this.disconnectedHandler);
        this.phone.on('registered', this.registeredHandler);
        this.phone.on('unregistered', this.unregisteredHandler);
        this.phone.on('registrationFailed', this.registrationFailedHandler);
        this.phone.on('newRTCSession', this.newRTCSessionHandler);
        this.phone.start();
    }

    public end(): void {
        if (this.phone) {
            console.log('stopping phone');
            this.phone.stop();
        }
        this.phone = null;
    }

    public newCall(number: string, trunk: string) {
        // newRTCSession fires synchronously inside call(), so the handler can read this
        this.outgoingTrunk = trunk;
        this.phone?.call('sip:' + number, {
            ...this.options,
            extraHeaders: [TRUNK_HEADER + ': ' + trunk],
            // fromUserName: number,
        });
    }

    public newRTCSessionHandler = async (e: RTCSessionEvent) => {
        console.log('new rtc session handler called');
        const trunk =
            e.session.direction === 'outgoing' ? this.outgoingTrunk : e.request.getHeader(TRUNK_HEADER) || '';
        this.event.emit('newRTCSession', { session: e.session, trunk });
    };

    private connectedHandler = (e: any) => {
        console.log('sip ua event: connected');
        this.event.emit('connected', e);
    };

    private disconnectedHandler = (e: any) => {
        console.log('sip ua event: disconnected');
        this.event.emit('disconnected', e);
    };

    private registeredHandler = (e: any) => {
        console.log('sip ua event: registered');
        this.event.emit('registered', e);
    };

    private unregisteredHandler = (e: any) => {
        console.log('sip ua event: unregistered');
        this.event.emit('unregistered', e);
    };

    private registrationFailedHandler = (e: any) => {
        console.log('sip ua event: registrationFailed');
        this.event.emit('registrationFailed', e);
    };

    private getSipConfiguration = (config: ConnectConfig): UAConfiguration => {
        const socket = new WebSocketInterface(config.wsConUrl);
        return {
            sockets: [socket],
            uri: config.username + '@' + new URL(config.wsConUrl).host,
            password: config.password,
            register: true,
            // @ts-ignore
            stun_servers: ['stun:stun.l.google.com:19302', 'stun:stun4.l.google.com:19302'],
        };
    };
}
