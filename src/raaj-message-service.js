/*
 * Copyright (C) 2013 Iorga Group
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see [http://www.gnu.org/licenses/].
 */
(function () {
    'use strict';

    angular.module('raaj-message-service', [])
        .provider('raajMessageService', function() {
            var raajMessageService = {},
                bootstrapVersion = '2.x',
                helpClass = '',
                helpElement = '',
                typePrefix = '',
                controlGroupClass = '',
                allTypeClassesStr = '';


            // config
            this.setBootstrapVersion = function(bootstrapVersionParam) {
                // can be '2.x' or '3.x'
                bootstrapVersion = bootstrapVersionParam;
                if (bootstrapVersion == '2.x') {
                    helpClass = 'help-inline';
                    helpElement = 'div';
                    typePrefix = '';
                    controlGroupClass = 'control-group';
                    allTypeClassesStr = 'warning error info success';
                } else if (bootstrapVersion == '3.x') {
                    helpClass = 'help-block';
                    helpElement = 'p';
                    typePrefix = 'has-';
                    controlGroupClass = 'form-group';
                    allTypeClassesStr = 'has-warning has-error has-info has-success';
                }
            };
            this.setBootstrapVersion('2.x'); // default to bootstrap 2.x

            // service
            raajMessageService.displayFieldMessages = function(fieldMessages, raajMessagesValue) {
                // fieldMessages = [{id: 'fieldId', message: 'messageToDisplay', type: 'warning' | 'error' | 'info' | 'success'}, ...]
                for (var i = 0; i < fieldMessages.length; i++) {
                    raajMessageService.displayFieldMessage(fieldMessages[i], raajMessagesValue);
                }
            };

            raajMessageService.displayFieldMessage = function(fieldMessage, raajMessagesValue) {
                var inputEl = jQuery('#'+fieldMessage.id); // search the input field
                if (inputEl.length > 0) {
                    // search the help-inline for that input
                    var helpEl = inputEl.next('.'+helpClass);
                    if (helpEl.length == 0) {
                        // the help inline doesn't exist, let's create it
                        helpEl = inputEl.after('<'+helpElement+' class="'+helpClass+'"/>').next('.'+helpClass);
                    }
                    // append the message to it
                    helpEl.append(fieldMessage.message);
                    // now search the parent "control-group" in order to change the type of warning
                    inputEl.parents('.'+controlGroupClass).eq(0)
                        .removeClass(allTypeClassesStr) // first remove previous messages type
                        .addClass(typePrefix+fieldMessage.type);	// and add this type
                } else {
                    // the input has not been found, let's append a "normal" message
                    raajMessageService.displayMessage({message: fieldMessage.id + ' : ' + fieldMessage.message, type: fieldMessage.type}, raajMessagesValue);
                }
            };

            raajMessageService.clearFieldMessages = function(idPrefix) {
                jQuery("[id^='"+idPrefix+"'] ~ ."+helpClass) // foreach help-inline which has a matching input as previous sibling
                    .empty() // clear all text inside
                    .parents('.'+controlGroupClass) // search the control-group
                    .removeClass(allTypeClassesStr); // and remove the type of message
            };

            raajMessageService.displayMessages = function(messages, raajMessagesValue) {
                for (var i = 0 ; i < messages.length ; i++) {
                    var message = messages[i];
                    raajMessageService.displayMessage(message, raajMessagesValue);
                }
            };

            raajMessageService.displayMessage = function(message, raajMessagesValue) {
                var raajMessagesEl = jQuery("[raajMessages^='"+raajMessagesValue+"']"); // find the raajMessages="raajMessagesValue" elements
                if (raajMessagesEl.length > 0) {
                    raajMessageService.appendMessageAlertToEl(raajMessagesEl, message, true);
                } else {
                    // no raajMessages found, let's append to global messages
                    raajMessageService.displayGlobalMessage(message);
                }
            };

            raajMessageService.displayGlobalMessage = function(message) {
                var raajGlobalMessagesEl = jQuery("[raajGlobalMessages]");
                if (raajGlobalMessagesEl.length == 0) {
                    // the global messages element doesn't exist, let's create a modal one
                    jQuery(document.body).append('<div raajGlobalMessages class="modal fade'+(bootstrapVersion == '3.x' ? '" data-show="false"' : ' hide"')+'>'+(bootstrapVersion == '3.x' ? '<div class="modal-dialog"><div class="modal-content">' : '')
                            +'<div class="modal-body"/><div class="modal-footer"><button class="btn btn-primary" data-dismiss="modal">OK</button></div>'
                            +(bootstrapVersion == '3.x' ? '</div></div>' : '')
                            +'</div>');
                    raajGlobalMessagesEl = jQuery("[raajGlobalMessages]");
                    raajGlobalMessagesEl.find('button').on('click', raajMessageService.clearGlobalMessages);
                }
                if (raajGlobalMessagesEl.hasClass("modal")) {
                    // this is a modal, let's append the message to its body
                    raajMessageService.appendMessageAlertToEl(raajGlobalMessagesEl.find('.modal-body'), message, false);
                    // and show it
                    raajGlobalMessagesEl.modal('show');
                } else {
                    // this is not a modal, let's just append the message to it
                    raajMessageService.appendMessageAlertToEl(raajGlobalMessagesEl, message, true);
                }
            };

            raajMessageService.appendMessageAlertToEl = function(element, message, closeButton) {
                var type = message.type;
                if (type == 'error' && bootstrapVersion == '3.x') {
                    type = 'danger';
                }
                element.append('<div class="alert alert-'+type+(bootstrapVersion == '3.x' ? ' fade in' : '')+'">'+(closeButton ? '<button type="button" class="close" data-dismiss="alert">&times;</button>' : '')+'<p>'+message.message+'</p></div>');
            };

            raajMessageService.clearMessages = function(raajMessagesValue) {
                var raajMessagesEl = jQuery("[raajMessages^='"+raajMessagesValue+"']");
                if (raajMessagesEl.length > 0) {
                    raajMessagesEl.empty();
                }
            };

            raajMessageService.clearGlobalMessages = function() {
                var raajGlobalMessagesEl = jQuery("[raajGlobalMessages]");
                if (raajGlobalMessagesEl.length > 0) {
                    if (raajGlobalMessagesEl.hasClass("modal")) {
                        // It's a modal, clear only .modal-body div
                        raajGlobalMessagesEl.find('.modal-body').empty();
                    } else {
                        raajGlobalMessagesEl.empty();
                    }
                }
            };

            raajMessageService.clearAllMessages = function(idPrefix) {
                raajMessageService.clearFieldMessages(idPrefix);
                raajMessageService.clearMessages(idPrefix);
                raajMessageService.clearGlobalMessages();
            };

            this.$get = function() {
                return raajMessageService;
            }
        })
    ;
})();