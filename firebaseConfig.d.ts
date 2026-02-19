// firebaseConfig.d.ts
declare module '*firebaseConfig.js' {
    import { FirebaseApp } from 'firebase/app';
    import { Auth } from 'firebase/auth';
    import { Firestore } from 'firebase/firestore';
    
    export const auth: Auth;
    export const db: Firestore;
    const app: FirebaseApp;
    export default app;
}