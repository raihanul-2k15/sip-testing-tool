export interface Profile {
    name: string;
    connectionUrl: string;
    sipUsername: string;
    sipPassword: string;
    sipHeaderKV: string;
    sipExtension: string;
}

export const isSameProfile = (p1, p2) => {
    return (
        p1.connectionUrl == p2.connectionUrl &&
        p1.sipUsername == p2.sipUsername &&
        p1.sipPassword == p2.sipPassword &&
        p1.sipHeaderKV == p2.sipHeaderKV &&
        p1.sipExtension == p2.sipExtension
    );
};
