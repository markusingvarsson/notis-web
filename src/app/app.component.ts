import { RouterOutlet } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdatePromptComponent } from './core/components/update-prompt/update-prompt.component';
import { ToasterService } from './shared/components/ui/toaster/toaster.service';
import { ToasterComponent } from './shared/components/ui/toaster/toaster.component';

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
})
export class AppComponent implements OnInit {
  private toaster = inject(ToasterService);

  ngOnInit(): void {
    setTimeout(() => {
      this.toaster.success('Operation completed successfully!');
    }, 0);

    setTimeout(() => {
      this.toaster.error('Operation failed!');
    }, 1000);

    setTimeout(() => {
      this.toaster.warning('Operation completed successfully!');
    }, 2000);

    setTimeout(() => {
      this.toaster.info('Operation completed successfully!');
    }, 3000);
  }
}
