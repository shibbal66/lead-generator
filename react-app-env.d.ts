/// <reference types="react-scripts" />

interface ProcessEnv {
  readonly REACT_APP_FIREBASE_VAPID_KEY: string;
}

interface Process {
  readonly env: ProcessEnv;
}
