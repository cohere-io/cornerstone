/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#writeReview') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        const description = $('#tab-description');
        const text = description.html().replace(/<(?:.|\n)*?>/gm, '');

        let shortDescription = text;

        if (text) {
            if (text.length > 300) {
                shortDescription = `${text.substr(0, 250)}...`;
            }
            if (shortDescription) {
                shortDescription = `<div class="productView-shortDescription">${shortDescription}</div><div class="productView-readMoreWrapper"><a class="productView-readMore">Read more</a></div>`;
                $('#short-description').html(shortDescription);
            }
            $('.productView-readMore').on('click', () => {
                $('html, body').animate({
                    scrollTop: $('#tab-description').offset().top - $('a[href="#tab-description"]').outerHeight(),
                }, 500);
            });
        }
        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation();
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        next();
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#writeReview') !== -1) {
            this.$reviewLink.click();
        }
    }
}
