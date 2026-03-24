import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';
                    
datadogRum.init({
    applicationId: 'c4c0ab0e-92a5-43ba-a411-02b4145c3d08',
    clientToken: 'pub862e0e71b383f296b814f2ed0161b4e5',
    site: 'datadoghq.com',
    service: 'Auroras',
    env: 'production',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    plugins: [reactPlugin({ router: false })],
});