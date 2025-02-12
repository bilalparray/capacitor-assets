import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Pica from 'pica';
import { MainComponent } from './main/main.component';
import { AboutComponent } from './about/about.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MainComponent, FooterComponent,NavbarComponent, ContactComponent,PrivacyComponent,AboutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  uploadedImage: string | null = null;
  originalFile: File | null = null;
  generatedFiles: { name: string; blob: Blob }[] = [];

  onImageUpload(event: any) {
    this.generatedFiles = [];
    const file = event.target.files[0];
    if (file) {
      this.originalFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async generateFiles() {
    if (!this.originalFile) return;

    const picaInstance = Pica();
    const image = new Image();
    const sizes = [
      { width: 1024, height: 1024, name: 'icon-only.png' },
      { width: 1024, height: 1024, name: 'icon-foreground.png' },
      { width: 2732, height: 2732, name: 'splash.png' },
      { width: 2732, height: 2732, name: 'splash-dark.png' },
      { width: 1024, height: 1024, name: 'icon-background.png' }, // Blank white
    ];

    const reader = new FileReader();
    reader.onload = (e: any) => {
      image.src = e.target.result;
      image.onload = async () => {
        this.generatedFiles = []; // Clear previous files
        for (const size of sizes) {
          const canvas = document.createElement('canvas');
          canvas.width = size.width;
          canvas.height = size.height;

          if (size.name === 'splash.png') {
            // White background for splash.png
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF'; // White background
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(
                image,
                (canvas.width - 1024) / 2,
                (canvas.height - 1024) / 2,
                1024,
                1024
              );
            }
          } else if (size.name === 'splash-dark.png') {
            // Dark background for splash-dark.png
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#000000'; // Dark background
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(
                image,
                (canvas.width - 1024) / 2,
                (canvas.height - 1024) / 2,
                1024,
                1024
              );
            }
          } else if (size.name === 'icon-background.png') {
            // Blank white canvas for icon-background.png
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF'; // White background
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } else {
            // Resize other images normally
            await picaInstance.resize(image, canvas);
          }

          const blob = await picaInstance.toBlob(canvas, 'image/png');
          this.generatedFiles.push({ name: size.name, blob });
        }
      };
    };
    reader.readAsDataURL(this.originalFile);
  }

  downloadBlob(blob: Blob, fileName: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  downloadAllFiles() {
    this.generatedFiles.forEach((file) => {
      this.downloadBlob(file.blob, file.name);
    });
  }
}
