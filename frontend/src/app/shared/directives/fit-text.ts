import {AfterViewInit, Directive, ElementRef, inject, input} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appFitText]'
})
export class FitText implements AfterViewInit {
  appFitTextContent = input<string>();

  private readonly _el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    const el = this._el.nativeElement as HTMLElement;
    const fullText = this.appFitTextContent() ? this.appFitTextContent()!.trim() : '';
    const words = fullText.split(' ');
    const maxHeight = el.parentElement?.offsetHeight ?? 0;

    let text = '';
    el.innerText = '';

    for (const word of words) {
      if (el.offsetHeight > maxHeight) {
        el.innerText = text.replace(/\s+\S+\s+\S+$/, '...');
        return;
      }

      text = text + (text ? ' ' : '') + word;
      el.innerText = text;
    }
  }
}
