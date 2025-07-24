import {Component} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {CarouselModule, OwlOptions} from "ngx-owl-carousel-o";

@Component({
    standalone: true,
    selector: 'app-main',
    imports: [
        CarouselModule,
        NgOptimizedImage,
        CommonModule,
    ],
    templateUrl: './main.html',
    styleUrl: './main.scss',
})
export class Main {
    customOptionsMain: OwlOptions = {
      loop: true,
      items: 1,
      dots: true,
      nav: true,
      autoplay: true,
      navText: ['', '']
    };
    customOptionsReviews: OwlOptions = {
      loop: true,
      items: 3,
      dots: false,
      nav: true,
      autoplay: true,
      navText: ['', '']
    };
}
