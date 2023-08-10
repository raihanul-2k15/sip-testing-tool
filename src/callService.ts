import { UA, WebSocketInterface } from 'jssip';
import { UAConfiguration } from 'jssip/lib/UA';
import mitt, { Emitter } from 'mitt';

interface ConnectConfig {
    wsConUrl: string;
    username: string;
    password: string;
    headerKV: string;
    extension: string
}

/**
 * Handle Call Related Functionalities
 */
export default class CallService {
    public event: Emitter<{
        newRTCSession: any;
        connected: any;
        disconnected: any;
        registered: any;
        unregistered: any;
        registrationFailed: any;
    }> = mitt();

    private extension: string = "";
    private phone: UA | null = null;
    private options = {
        mediaConstraints: { audio: true, video: false },
    };

    public init(config: ConnectConfig) {
        this.extension = config.extension;
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

    public newCall(number: string) {
        console.log("extension: "+this.extension);
        this.phone?.call('sip:'+this.extension, {
            ...this.options,
            fromUserName: number,
        });
    }

    public newRTCSessionHandler = async (e: any) => {
        console.log('new rtc session handler called');
        this.event.emit('newRTCSession', e);
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
            extra_headers: [config.headerKV],
        };
    };
}
