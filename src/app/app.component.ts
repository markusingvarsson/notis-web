import { RouterOutlet } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdatePromptComponent } from './core/components/update-prompt/update-prompt.component';
import { ToasterComponent } from './components/ui/toaster/toaster.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    UpdatePromptComponent,
    ToasterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
