import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

async function bootstrap() {
  // Server-side: localStorage is not available, default to webkit-speech
  const adapterProviders = (
    await import(
      './app/domain/notes/services/transcription/providers/webkit-speech/webkit-speech.provider'
    )
  ).WEBKIT_SPEECH_PROVIDER;

  return bootstrapApplication(AppComponent, {
    ...config,
    providers: [...config.providers, ...adapterProviders],
  });
}

export default bootstrap;
