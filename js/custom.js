/* Russian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by Andrew Stromnov (stromnov@gmail.com). */
// https://jquery-ui.googlecode.com/svn/tags/latest/ui/i18n/jquery.ui.datepicker-ru.js
jQuery(function($) {
    $.datepicker.regional['ru'] = {
        closeText: 'Закрыть',
        prevText: '&#x3c;Пред',
        nextText: 'След&#x3e;',
        currentText: 'Сегодня',
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ],
        monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
        ],
        dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        weekHeader: 'Нед',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['ru']);
});

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    //console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
        alert('Копирование не поддерживается вашим браузером');
    }

    document.body.removeChild(textArea);
}


// Main
$(document).ready(function() {
    $.extend($.tablesorter.defaults, {
        theme: 'blue',
        widthFixed: false,
        sortReset: true
    });
    $(".results table").tablesorter();

    $("input[type=text], input[type=date]").addClear({
        right: 10,
        showOnLoad: true,
        tabbable: false,
        returnFocus: false
    });

    var params_template = {
        "query": {
            "filtered": {
                "query": {
                    "bool": {
                        "must": [],
                        "should": [],
                        "minimum_should_match": 1
                    }
                },
                "filter": {
                    "bool": {
                        "must": [],
                        "must_not": {
                            "type": {
                                "value": "chelovek"
                            }
                        }
                    }
                }
            }
        },
        "size": 50,
        "from": 0,
        // "sort": {
        //     "document_date_b": "asc"
        // },
//        "fields": ["operation", "id", "document_type", "document_number",
//            "document_date_b", "document_date_f", "document_name", "place_birth", "opis", "delo",
//            "list", "date_from", "date_to", "authors", "geo_names", "image_path", "deal_type"
//        ]
    };
    
    var customAPI, url;
    //var API = 'https://cdn.pamyat-naroda.ru/ind/';
    var API = 'https://cdn.pamyat-naroda.ru/ind/memorial/_search';
    //var imagesCDN = 'https://cdn.pamyat-naroda.ru/imageload/';

    $('#apiURL').val('');
    $('#apiURL').on('change', function() {
        customAPI = $('#apiURL').val();
    });
    
    jQuery.fn.get_data = function() {
        var tableID, link;
        tableID = '#res_table';
        
        API = customAPI || API;
        
        $('.results table, .pagination').hide();
        $('tbody', tableID).empty();
        $.ajax({
            url: API,
            type: "POST",
            data: JSON.stringify(params),
            contentType: 'text/plain',
            dataType: 'json',
            error: function(data) {
                response = data;
                console.log('[*]Error:', data);
                $('#res').val(data.responseText);
                $('.message').html('<b>Ошибка загрузки!</b>');
            },
            success: function(data) {
                response = data;
                console.log('[*]Response:', data);
                $('#res').val(JSON.stringify(data));
                
                if (data.hits.hits.length) {
                    var firstRes = params.from + 1;
                    var lastRes = params.from + data.hits.hits.length;
                    $('.message').html(
                        'Загружены результаты <b>' + firstRes + '-' + lastRes +
                        '</b>  из <b>' + data.hits.total + '</b>'
                    );
                } else {
                    $('.message').html(
                        'Ничего не найдено'
                    );
                }
                if (data.hits.total > 0) {
                    var trHTML = '';
                    data.hits.hits.forEach(function(row) {
                        var type = row._source._type;
                        if (type == 'chelovek_dopolnitelnoe_donesenie') {
                            type = 'dopolnit_donesenie';
                        } else if (type == 'chelovek_kartoteka_memorial') {
                            type = 'kartoteka_memorial'
                        } else if (type == 'chelovek_kniga_pamyati') {
                            type = 'kniga_pamyati'
                        } else if (type == 'chelovek_pechatnoi_knigi_pamyati') {
                            type = 'pech_knigi_pamyati'
                        }

                        link = '<a href="' + 'https://obd-memorial.ru/html/info.htm?id=' +
                            row._id + '" target="_blank">' + row._id + '</a>';
                        trHTML +=
                            '<tr><td>' + link + '</td><td class="nowrap">' +
                            (row._source.last_name ? row._source.last_name : '') + '</td><td>' +
                            (row._source.first_name ? row._source.first_name : '') + '</td><td class="nowrap">' +
                            (row._source.middle_name ? row._source.middle_name : '') + '</td><td class="nowrap">' +
                            (row._source.date_birth ? row._source.date_birth : '') + '</td><td>' +
                            (row._source.place_birth ? row._source.place_birth : '') + '</td><td>' +
                            (row._source.data_i_mesto_priziva ? row._source.data_i_mesto_priziva : '') + '</td><td>' +
                            (row._source.data_vibitiya ? row._source.data_vibitiya: '') + '</td><td>' +
                            (row._source.prichina_vibitiya ? row._source.prichina_vibitiya: '') + '</td><td>' +
                            (row._source.poslednee_mesto_sluzhbi ? row._source.poslednee_mesto_sluzhbi: '') + '</td><td>' +
                            type + '</td>';
                        trHTML += '</tr>';
                    });
                    $('tbody', tableID).append(trHTML);
                    $(tableID).trigger("update");
                    $(tableID).show();
                    if (data.hits.total > params.size) {
                        $('.pagination').css('display', 'block');
                    }
                }
            }
        });
    };
    
    var params;
    build_params();
    $("#dou, input[name=switch]").on('change', function() {
        build_params();
    });
    $('#dou, #advanced').on('submit', function(event) {
        event.preventDefault();
        $.fn.get_data();
    });

///////////////////////

    function build_params() {
        params = JSON.parse(JSON.stringify(params_template));
        
        var date_birth = $("#date_birth").val().trim();
        date_birth = addAsterisk(date_birth);
        if (date_birth != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": date_birth,
                    "default_field": "date_birth",
                    "default_operator": "and",
                    //"analyze_wildcard": "true"
                }
            });
        }
        
        var data_vibitiya = $("#data_vibitiya").val().trim();
        data_vibitiya = addAsterisk(data_vibitiya);
        if (data_vibitiya != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": data_vibitiya,
                    "default_field": "data_vibitiya",
                    "default_operator": "and",
                    "analyze_wildcard": "true"
                }
            });
        }
        
        $("#checkboxes div input:checked").each(function(k, v) {
            params.query.filtered.query.bool.should.push({
                "match_phrase": {
                    "document_type": v.value.trim()
                }
            });
        });
            
        if ($("#place_birth").val().trim() != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": $("#place_birth").val().trim(),
                    "default_field": "place_birth",
                    "default_operator": "and"
                        // "analyze_wildcard": "true"
                }
            });
        }
        if ($("#poslednee_mesto_sluzhbi").val().trim() != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": $("#poslednee_mesto_sluzhbi").val().trim(),
                    "default_field": "poslednee_mesto_sluzhbi",
                    "default_operator": "and"
                        // "analyze_wildcard": "true"
                }
            });
        }
        
        var data_i_mesto_priziva = $("#data_i_mesto_priziva").val().trim();
        data_i_mesto_priziva = addAsterisk(data_i_mesto_priziva);
        if (data_i_mesto_priziva != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": data_i_mesto_priziva,
                    "default_field": "data_i_mesto_priziva",
                    "default_operator": "and"
                        // "analyze_wildcard": "true"
                }
            });
        }
        // if ($("#doc_name").val().trim() != '') {
        //     params.query.filtered.query.bool.must.push({
        //         "match": {
        //             "document_name": {
        //                 "query": $("#doc_name").val().trim(),
        //                 "operator": "and"
        //             }
        //         }
        //     });
        // }

        var first_name = $("#first_name").val().trim();
        if (first_name != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": first_name,
                    "default_field": "first_name",
                    "default_operator": "and"
                        // "analyze_wildcard": "true"
                }
            });
        }

        var last_name = $("#last_name").val().trim();
        if (last_name != '') {
            params.query.filtered.query.bool.must.push({
                //     "match_phrase": {
                //         "authors": {
                //             "query": author,
                //             "slop": 1 // макс расстояние между словами
                //         }
                //     }
                "query_string": {
                    "query": last_name,
                    "default_field": "last_name",
                    "default_operator": "and"
                }
            });
        }

        if ($("#middle_name").val().trim() != '') {
            params.query.filtered.query.bool.must.push({
                "query_string": {
                    "query": $("#middle_name").val().trim(),
                    "default_field": "middle_name",
                    "default_operator": "and"
                }
            });
        }

        if ($("#size").val().trim() != '') {
            params.size = parseInt($("#size").val().trim());
        }

        var sort = $("#sort").val().trim();
        if (sort && sort !== 'match') {
            var temp = {};
            if (sort == "id") {
                temp[sort] = "desc";
            }
            else {
                temp[sort] = "asc";
            }
            params.sort = temp;
        }

        $('#params').val(JSON.stringify(params));
    };


    function addAsterisk(term) {
        // костыль, добавляем звездочку перед датами
        term = term.replace(/^\d/g, '*$&');
        term = term.replace(/([^\*\.\d])(\d)/g, '$1*$2');
        return term;
    }

    if ($('#advanced_settings').prop("checked")) {
        $('#advanced').show();
    }
    $('#advanced_settings').on('change', function(event) {
        event.preventDefault();
        $('#advanced').toggle();
    });
    $('#params').on('change', function() {
        params = JSON.parse($('#params').val().trim());
    });

    $(".next").on('click', function() {
        if (response.hits.total > (params.size + params.from)) {
            params.from += params.size;
            $('#params').val(JSON.stringify(params));
            $.fn.get_data();
        }
    });
    $(".prev").on('click', function() {
        if (params.from > 0) {
            params.from -= params.size;
            $('#params').val(JSON.stringify(params));
            $.fn.get_data();
        }
    });

    $('#reset_dou').on('click', function(e) {
        e.preventDefault();
        $('#dou')[0].reset();
        $('#dou input[type=text]').val('').trigger('keyup');
        $('#dou').trigger('change');
    });

    // Checkboxes
    $('.selectBox1').click(function(e) {
        $('#checkboxes').toggle();
        $('.multiselect').toggleClass('active');
    });
    $(document).bind('click', function(e) {
        var clicked = $(e.target);
        if (!clicked.parents().hasClass("multiselect")) {
            $('#checkboxes').hide();
            $('.multiselect').removeClass('active');
        }
    });
    $("#reset_checkboxes").on('change', function() {
        if (this.checked) {
            $('#checkboxes div input').prop('checked', false);
        }
    });
    $("#checkboxes div input").on('change', function() {
        if ($("#checkboxes div input[type=checkbox]:checked").length == 0) {
            $('#reset_checkboxes').prop('checked', true);
        }
        else {
            $('#reset_checkboxes').prop('checked', false);
        }
    });

    //Popup
    var nick = 'venireman';
    var message = '<p>Если поиск перестанет работать, пишите на <a href="mailto:' + nick +
        '@yandex.ru?subject=Pamyat-naroda-search">' + nick + '@yandex.ru</a></p>'
    $('#info').append(message);
    $('#show-info').magnificPopup({
        items: {
            src: '#info',
            type: 'inline',
            midClick: true
        }
    });
    
    //Copy links
    $('table.tablesorter').on('click', 'span.path', function() {
        //console.log($(this).attr('path'));
        var path = $(this).find('img').attr( "title" );
        copyTextToClipboard(path);
    });
});
