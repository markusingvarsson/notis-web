import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

async function main() {
  const isTrue = false;

  const adapterProviders = isTrue
    ? (
        await import(
          './app/domain/notes/services/transcription/providers/webkit-speech/webkit-speech.provider'
        )
      ).WEBKIT_SPEECH_PROVIDER
    : (
        await import(
          './app/domain/notes/services/transcription/providers/whisper/whisper.provider'
        )
      ).WHISPER_RPOVIDER;

  await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [...appConfig.providers, ...adapterProviders],
  }).catch((err) => console.error(err));
}
main();
