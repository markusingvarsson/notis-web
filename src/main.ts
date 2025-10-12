import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

async function main() {
  // Read provider config from localStorage, default to 'webkit-speech'
  const storedProvider = localStorage.getItem('transcriptionProvider');
  const useWhisper = storedProvider === 'whisper';

  const adapterProviders = useWhisper
    ? (
        await import(
          './app/domain/notes/services/transcription/providers/whisper/whisper.provider'
        )
      ).WHISPER_RPOVIDER
    : (
        await import(
          './app/domain/notes/services/transcription/providers/webkit-speech/webkit-speech.provider'
        )
      ).WEBKIT_SPEECH_PROVIDER;

  await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [...appConfig.providers, ...adapterProviders],
  }).catch((err) => console.error(err));
}
main();
