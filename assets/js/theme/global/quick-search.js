import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';

export default function () {
    const TOP_STYLING = 'top: 25px;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchDiv = $('#quickSearch');
    const $searchQuery = $('#search_query');
    const stencilDropDownExtendables = {
        hide: () => {
            $searchQuery.blur();
        },
        show: (event) => {
            $searchQuery.focus();
            event.stopPropagation();
        },
    };
    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    stencilDropDown.bind($('[data-search="quickSearch"]'), $quickSearchDiv, TOP_STYLING);

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        if ($(e.target).parent().hasClass('modal-close')) {
            $quickSearchResults.html('');
            $('.body').show();
        } else if ($(e.target).closest('[data-prevent-quick-search-close], .modal-background').length === 0) {
            stencilDropDown.hide($container);
            $('.body').show();
        }
    };

    // stagger searching for 200ms after last input
    const doSearch = _.debounce((searchQuery) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false;
            }
            $quickSearchResults.html(response);
            $('.body').hide();
        });
    }, 200);

    utils.hooks.on('search-quick', (event) => {
        const searchQuery = $(event.currentTarget).val();

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            $quickSearchResults.html('');
            $('.body').show();
            return;
        }

        doSearch(searchQuery);
    });

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', (event) => {
        const searchQuery = $(event.currentTarget).find('input').val();

        if (searchQuery.length === 0) {
            return event.preventDefault();
        }

        return true;
    });
}
