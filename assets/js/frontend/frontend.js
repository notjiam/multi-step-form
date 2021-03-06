jQuery(document).ready(function($) {
    "use strict";
    var data = {};
    var err = [
        ajax.i18n.errors.requiredFields,
        ajax.i18n.errors.requiredField,
		ajax.i18n.errors.someRequired + '<br>' + ajax.i18n.errors.checkFields
    ];

    function log() {
        if (window.console) console.log.apply(console, arguments);
    }

    function warn() {
        if (window.console) console.warn.apply(console, arguments);
    }

    function hideStep($wizard, stepId) {
        var $progress;
        $wizard.find('.fw-wizard-step[data-stepId="' + stepId + '"]')
            .removeClass('fw-current');
        $wizard.find('.fw-wizard-step-header[data-stepId="' + stepId + '"]')
            .removeClass('fw-current');
        $progress = $wizard.find('.fw-progress-step[data-id="' + stepId + '"]');
        $progress.removeClass('fw-active');
        $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + stepId + '"]').removeClass('fwp-active');
    }

    function showStep($wizard, stepId) {
        var $progress;
        $wizard.find('.fw-wizard-step[data-stepId="' + stepId + '"]')
            .addClass('fw-current');
        $wizard.find('.fw-wizard-step-header[data-stepId="' + stepId + '"]')
            .addClass('fw-current');
        $progress = $wizard.find('.fw-progress-step[data-id="' + stepId + '"]');
        $progress.addClass('fw-active');
    }

    function disablePrevious($wizard) {
        // $wizard.find('.fw-button-previous').prop('disabled', true);
        $wizard.find('.fw-button-previous').hide();
    }

    function disableNext($wizard) {
        // $wizard.find('.fw-button-next').prop('disabled', true);
        $wizard.find('.fw-button-next').hide();
    }

    function enablePrevious($wizard) {
        // $wizard.find('.fw-button-previous').prop('disabled', false);
        $wizard.find('.fw-button-previous').show();
    }

    function enableNext($wizard) {
        // $wizard.find('.fw-button-next').prop('disabled', false);
        $wizard.find('.fw-button-next').show();
    }

    function previous() {
        var $wizard = getWizard($(this));
        var step = getStep($wizard);
        var stepInt = parseInt(step, 10);
        var $circle = $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + step + '"]');
        var $bar = $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + (stepInt - 1) + '"]');
        var $progress = $wizard.find('.fw-progress-step[data-id="' + (stepInt - 1) + '"]');
        $progress.removeClass('fw-visited');
        $wizard.find('.fw-progress-step[data-id="' + step + '"]').removeClass('fw-visited');
		$circle.removeClass('fwp-done');
		if (stepInt == 5) {
			$wizard.find('.fw-progress-bar').removeClass('fw-step-after-fifth')
		}
        $circle.find('.fwp-label').html(parseInt(step, 10) + 1);
        $bar.removeClass('fwp-active');
        if (stepInt >= 2) {
            $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + (stepInt - 2) + '"]')
                .removeClass('fwp-done').addClass('fwp-active');

        }
        hideStep($wizard, step--);
        $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + step + '"]')
            .find('.fwp-label').html(parseInt(step, 10) + 1);
        showStep($wizard, step);
        if (step === 0) {
            disablePrevious($wizard);
        }
        enableNext($wizard);
    }

    function next() {
        var $wizard = getWizard($(this));
        var step = getStep($wizard);
        var stepInt = parseInt(step, 10);
        var $circle = $wizard.find('.fwp-progress-bar .fwp-circle[data-id="' + step + '"]');
        var $bar = $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + step + '"]');
        if (validateStep(step)) {
            $wizard.find('.fw-progress-step[data-id="' + step + '"]').addClass('fw-visited');
			if (stepInt == 4) {
				$wizard.find('.fw-progress-bar').addClass('fw-step-after-fifth');
			}
			$circle.removeClass('fwp-active').addClass('fwp-done');
            $circle.find('.fwp-label').html('&#10003;');
            $bar.addClass('fwp-active');
            if (stepInt >= 1) {
                $wizard.find('.fwp-progress-bar .fwp-bar[data-id="' + (stepInt - 1) + '"]')
                    .removeClass('fwp-active').addClass('fwp-done');
            }
            hideStep($wizard, step++);
            showStep($wizard, step);
            if (step === (getStepCount($wizard) - 1)) {
                disableNext($wizard);
            }
            enablePrevious($wizard);
            // scroll back to top on next step
            $('html, body').animate({
                scrollTop: $("#multi-step-form").offset().top - 100
            }, 500);
        }
    }

    function textSummary(summaryObj, $block, title, required) {
        var header = $block.find('h3').text();
        var value = $block.find('.fw-text-input').val();
        pushToSummary(summaryObj, title, header, value, required);
    }

    function textareaSummary(summaryObj, $block, title, required) {
        var header = $block.find('h3').text();
        var value = $block.find('.fw-textarea').val();
        pushToSummary(summaryObj, title, header, value, required);
    }

    function pushToSummary(summaryObj, title, header, value, required) {
        var s = {};
        if (value) {
            s[header] = value;
            getArray(summaryObj, title).push(s);
        } else if (required == 'true') {
            s['<p class="fw-step-summary fw-summary-invalid">' + header] = '</p>';
            getArray(summaryObj, title).push(s);
        }

    }

    function radioSummary(summaryObj, $block, title, required) {
        var header = $block.find('h3').text();
        var value = '';
        $block.find('.fw-choice').each(function(idx, element) {
            if ($(element).find('input').is(':checked')) {
                if (value != '') {
                    value += ', ';
                }
                value += $(element).find('label').text();
            }
        });
        pushToSummary(summaryObj, title, header, value, required);
    }

    function selectSummary(summaryObj, $block, title, required) {
        var header = $block.find('h3').text();
        var value = $block.find('select').select2('data')[0].text;
        pushToSummary(summaryObj, title, header, value, required);
    }

    function checkboxSummary(summaryObj, $block, title, required) {
        var header = $block.find('label').text();
        var value;
        if ($block.find('.fw-checkbox').is(':checked')) {
            value = 'yes';
        }
        if ($block.hasClass('fw-block-invalid')) {
            console.log('INVALID' + $block);
        }
        pushToSummary(summaryObj, title, header, value, required);
	}
	
	function registrationSummary(summaryObj, $block, title, required) {
        var header = ajax.i18n.registration;
		var username = $block.find('.msfp-registration-input[data-id=username]').val();	
		var email = $block.find('.msfp-registration-input[data-id=email]').val();
		var value = '';
		if (username && email) {
			value = username + ' (' + email + ')';
		} else {
			value = ajax.i18n.registrationFailed;
		}
        pushToSummary(summaryObj, title, header, value, required);
	}
	
	function blockSummary(summaryObj, $block, title) {
		var required = $block.attr('data-required');
		switch ($block.attr('data-type')) {
			case 'fw-email':
			case 'fw-date':
			case 'fw-text':
				textSummary(summaryObj, $block, title, required);
				break;
			case 'fw-textarea':
				textareaSummary(summaryObj, $block, title, required);
				break;
			case 'fw-radio':
				radioSummary(summaryObj, $block, title, required);
				break;
			case 'fw-select':
				selectSummary(summaryObj, $block, title, required);
				break;
			case 'fw-checkbox':
				checkboxSummary(summaryObj, $block, title, required);
				break;
			case 'fw-registration':
				registrationSummary(summaryObj, $block, title, required);
			default:
				break;
		}
	}

    function stepSummary($wizard, stepNum, summaryObj) {
        var summary = '';
        var $step = $wizard.find('.fw-wizard-step[data-stepId="' + stepNum + '"]');
        $step.find('.fw-step-part').each(function(idx, element) {
			var title = $(element).find('.fw-step-part-title').text().trim();
			// here comes the ugliest jQ selector
			var $visibleBlocks = $(element).find('.fw-step-block:not(.fw-step-block[style="display: none;"] > .fw-step-block):not(.msfp-block-conditional)');
            $visibleBlocks.each(function(idx, element) {
               blockSummary(summaryObj, $(element), title);
            });
        });
        return summary;
    }

    function removeFakePath(path) {
      return path.replace(/^.*\\/, "");
    }

    function getAttachments() {
        var files = [];
        $('.fw-step-block[data-type=fw-file]').each(function(i, e) {
            getAttachment(e, files);
        });
        return files;
	}
	
	function getRegistration() {
		var res = {};
		$('.msfp-registration-input').each(function(index, element) {
			var field = $(element).attr('data-id');
			res[field] = $(element).val();
		});
		return res;
	}

    function getAttachment(e, files) {
		var attachments = $(e).find("input")[0].files;
		for (var i = 0; i < attachments.length; i++) {
			files.push(attachments[i].name);
		}
    }

    function getSummary($wizard) {
        var i;
        var stepCount = getStepCount($wizard);
        var summaryObj = {};
        for (i = 0; i < stepCount; i++) {
            stepSummary($wizard, i, summaryObj);
        }
        return summaryObj;
    }

    function getSummaryHtml($wizard) {
        var summaryHtml = '';
        var summaryObj = getSummary($wizard);
        for (var key in summaryObj) {
            summaryHtml += '<div class="fw-step-summary-part">';
            summaryHtml += renderStepSummaryTitle(key);
            summaryHtml += renderStepSummaries(summaryObj[key]);
            summaryHtml += '</div>';
        }
        return summaryHtml;
    }

    function renderStepSummaryTitle(title) {
        return '<p class="fw-step-summary-title">' + title + '</p>';
    }

    function renderStepSummary(summary) {
		var key;
		var html = '';
        for (key in summary) {
			html = '<p class="fw-step-summary">' + key + ' \u2014 ' + summary[key] + '</p>';
		}
		return html;
    }

    function renderStepSummaries(summaries) {
        var i, n;
        var result = '';
        for (i = 0, n = summaries.length; i < n; i++) {
            result += renderStepSummary(summaries[i]);
        }
        return result;
    }

    function updateSummary($wizard) {
        var summary = getSummaryHtml($wizard);
        var $summary = $wizard.find('.fw-wizard-summary');
        $summary.empty();
        $summary.append(summary);
        $('.fw-toggle-summary').toggle(
            function() {
                $('.fw-wizard-summary').slideDown();
                $('.fw-toggle-summary').text(ajax.i18n.hideSummary);
            },
            function() {
                $('.fw-wizard-summary').slideUp();
                $('.fw-toggle-summary').text(ajax.i18n.showSummary);
            }
        );
        if ($('.fw-summary-invalid').length) {
            $summary.prepend('<div class="fw-summary-alert">' + err[2] + '</div>');
        } else {
            $('.fw-summary-alert').remove();
        }
    }

    function getWizard($elt) {
        return $elt.closest('.fw-wizard');
    }

    function getStepCount($wizard) {
        return $wizard.attr('data-stepCount');
    }

    function getStep($wizard) {
        return $wizard.find('.fw-current').attr('data-stepId');
    }

    function getStepId($elt) {
        return $elt.closest('.fw-wizard-step').attr('data-stepId');
    }

    function getPartId($elt) {
        return $elt.closest('.fw-step-part').attr('data-partId');
    }

    function getBlockId($elt) {
        return $elt.closest('.fw-step-block').attr('data-blockId');
    }

    function get(obj) {
        var args = [].slice.call(arguments, 1);
        var i = 0,
            n = args.length;
        log('args', args);
        if (args[0] === "0") {
            throw new TypeError();
        }
        for (; i < n; i++) {
            obj = _get(obj, args[i]);
        }
        return obj;
    }

    function _get(obj, prop) {
        if (!obj[prop]) {
            obj[prop] = {};
        }
        return obj[prop];
    }

    function getObj($wizard, $target) {
        var stepId = getStepId($target);
        var partId = getPartId($target);
        var blockId = getBlockId($target);
        return get(data, $wizard.attr('id'), stepId, partId, blockId);
    }

    function getArray(obj, prop) {
        //log('obj', obj, 'prop', prop);
        if (!obj[prop]) {
            obj[prop] = [];
        }
        return obj[prop];
    }

    function check() {
        var $target = $(this);
        var $wizard = getWizard($target);
        var checked = $target.prop('checked');
        var obj = getObj($wizard, $target);
        var optId = $target.attr('data-id');
        if (checked) {
            obj[optId] = "checked";
        } else {
            delete(obj[optId]);
        }

        updateSummary($wizard);
    }

    function unset($wizard, $target) {
        var wizardId = $wizard.attr('id');
        var group = $target.attr("name");
        var blockId = getBlockId($target);
        var $radios = $('.fw-radio[name="' + group + '"]');
        var multi = false;
        var stepId, partId, obj;
        log('radios', $radios);
        $radios.each(function(idx, element) {
            if (blockId !== getBlockId($(element))) {
                multi = true;
            }
        });
        stepId = getStepId($target);
        partId = getPartId($target);

        if (multi) {
            obj = get(data, wizardId, stepId);
            delete(obj[partId]);
        } else {
            obj = get(data, wizardId, stepId, partId);
            delete(obj[blockId]);
        }
        updateSummary($wizard);
    }

    function checkConditional() {
        var $target = $(this);
        var id = $target.attr('data-id');
        var $conditional = $target.closest('.fw-conditional');

        $conditional.find('.fw-conditional-then').removeClass('fw-selected');

        $conditional.find('.fw-conditional-then[data-id="' + id + '"]').addClass('fw-selected');

    }

    function checkRadio() {
        var $target = $(this);
        var $wizard = getWizard($target);
        unset($wizard, $target);
        var obj = getObj($wizard, $target);
        var optId = $target.attr('data-id');
        obj[optId] = "checked";

        updateSummary($wizard);
    }

    function textOnChange() {
        var $target = $(this);
        var $wizard = getWizard($target);
        var value = $target.val();
        log(value);
        var id = $target.attr('data-id');
        var obj = getObj($wizard, $target);
        obj[id] = value;
        $target.parents('.fw-step-block').removeClass('fw-block-invalid');
        $target.parents('.fw-step-block').find('.fw-block-invalid-alert').remove();
        updateSummary($wizard);
    }

    function dump() {
        var $wizard = getWizard($(this));
        log('step', getStep($wizard));
        log('stepCount', getStepCount($wizard));
        log('data', data);
        log('summary', getSummary($wizard));
    }

    function checkInvalidChange(event) {
        // remove fw-block-invalid when invalid text field is changed
        console.log($(this).parents('.fw-step-block'));
        if ($block.hasClass('fw-block-invalid')) {
            $block.removeClass('fw-block-invalid');
        }
    }

    function validateRadio($element) {
        var valid = false;
        $element.children('.fw-choice').find('input').each(function(i, r) {
            var $r = $(r);
            if ($r.is(':checked')) {
                console.log(i);
                valid = true;
            }
        });
        if (!valid) {
            $element.addClass('fw-block-invalid');
        }
        return valid;
    }

    function validateSelect($element) {
        var valid = false;
        var $select = $element.find("select");
        if ($select.val()) {
            valid = true;
        }
        return valid;

    }

    function validateEmail($element) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var email = $element.find('.fw-text-input').val();
        if (!email || !re.test(email)) {
            $element.addClass('fw-block-invalid');
            return false;
        } else {
            return true;
        }
    }

    function validateFile($element) {
        if (!$element.find('.fw-file-upload-input').val()) {
            $element.addClass('fw-block-invalid');
            return false;
        } else {
            return true;
        }
    }

    function validateDate($element) {
        if (!$element.find('.fw-text-input').val()) {
            $element.addClass('fw-block-invalid');
            return false;
        } else {
            return true;
        }
    }


    function validateText($element) {
        if (!$element.find('.fw-text-input').val()) {
            $element.addClass('fw-block-invalid');
            return false;
        }
        return true;
    }

    function validateTextArea($element) {
        if (!$element.find('.fw-textarea').val()) {
            $element.addClass('fw-block-invalid');
            return false;
        }
        return true;
    }

    function validateCheckbox($element) {
        if (!$element.find('.fw-checkbox').prop('checked')) {
            $element.addClass('fw-block-invalid');
            return false;
        }
        return true;
    }

    function validateSubmit($element) {
        var name = $element.find('[data-id=name]').val();
        var email = $element.find('[data-id=email]').val();
        var valid = true;
        if (!name || !email) {
            if ($element.has('input')) {
                valid = true;
            } else {
                $element.addClass('fw-block-invalid');
                valid = false;
            }
        }
        return valid;
	}

	function validateRegistration($block) {
		var valid = true;
		var $username = $block.find('[data-id=username]');
		var $email = $block.find('[data-id=email]');
		var hasValidUsername = $username.hasClass('msfp-reg-username-valid');
		var hasValidEmail = $email.hasClass('msfp-reg-email-valid');
		if (!hasValidUsername) {
			$block.addClass('fw-block-invalid');
			$username.removeClass("msfp-reg-username-valid");										
			$username.addClass('msfp-registration-invalid');
			valid = false;
		}
		if (!hasValidEmail) {
			$block.addClass('fw-block-invalid');
			$email.removeClass("msfp-reg-email-valid");										
			$email.addClass('msfp-registration-invalid');
			valid = false;
		}
		return valid;
	}

    function validateStep(idx) {
        var valid = true;
        var emailValid = true;
        var stepValid = true;
        $('.fw-wizard-step[data-stepid="' + idx + '"] .fw-step-block[data-required="true"]:visible').each(
            function(i, element) {
                var $element = $(element);
                var type = $element.attr('data-type');
                switch (type) {
                    case 'fw-radio':
                        valid = validateRadio($element);
                        break;
                    case 'fw-select':
                        valid = validateSelect($element);
                        break;
                    case 'fw-textarea':
                        valid = validateTextArea($element);
                        break;
                    case 'fw-text':
                        valid = validateText($element);
                        break;
                    case 'fw-email':
                        valid = validateEmail($element);
                        emailValid = valid;
                        break;
                    case 'fw-file':
                        valid = validateFile($element);
                        break;
                    case 'fw-date':
                        valid = validateDate($element);
                        break;
                    case 'fw-checkbox':
                        valid = validateCheckbox($element);
                        break;
                    case 'fw-submit':
                        valid = validateSubmit($element);
						break;
					case 'fw-registration':
						valid = validateRegistration($element);
						break;
                    default:
                        break;
                }
                if (!valid) {
                    stepValid = false;
                }
            }
        );

        // validate filled email fields
        $('.fw-wizard-step[data-stepid="' + idx + '"] .fw-step-block[data-type="fw-email"]').each(
            function(i, element) {
                var $element = $(element);
                if ($element.find('.fw-text-input').val() != "") {
                    valid = validateEmail($element);
                    if (!valid) {
                        stepValid = false;
                    }
                }
            }
		);

        if (!stepValid) {
            $('.fw-block-invalid').each(function(idx, element) {
                if ($(element).find('.fw-block-invalid-alert').length < 1) {
					if ($(element).attr('data-type') == 'fw-registration') {
						$(element).append('<div class="fw-block-invalid-alert">' + ajax.i18n.errors.checkFields + '</div>');						
					} else if ($(element).attr('data-type') == 'fw-email') {
						$(element).append('<div class="fw-block-invalid-alert">' + ajax.i18n.errors.invalidEmail + '</div>');						
				    } else {
						$(element).append('<div class="fw-block-invalid-alert">' + err[1] + '</div>');
					}
                }
            });
            alertUser(err[0], false);
		}

        return stepValid;
	}

	function validateRegEmail($element) {
		var $block = $element.closest('.fw-step-block');		
		var email = $element.val();
		var data = {
			action: 'msfp_pre_validate_reg_email',
			email: email,
			nonce: ajax.nonce
		};
		$.ajax({
            type: 'POST',
            url: ajax.ajaxurl,
            data: data,
			dataType: "json",
            success: function(r) {
				console.log(r);
				if (r.success) {
					$element.removeClass('msfp-registration-invalid');					
					$element.addClass("msfp-reg-email-valid");
					$element.next().next().remove('.fw-block-invalid-alert');
					// remove block-invalid if username is also valid
					if ($block.find('.msfp-reg-username-valid').length > 0) {
						$block.removeClass('fw-block-invalid');
					}

				} else {
					$block.addClass('fw-block-invalid');
					$element.addClass('msfp-registration-invalid');
					$element.removeClass("msfp-reg-email-valid");					
					if (!$element.next().next().hasClass('fw-block-invalid-alert')){
						$element.next().after('<div class="fw-block-invalid-alert">' + r.error + '</div>');
					}
				}
            },
            fail: function(resp) {
				valid = false;				
				warn('response', resp);
				warn('responseText', resp.responseText);
			}
		});
	}

	function validateRegUsername($element) {
		var $block = $element.closest('.fw-step-block');		
		var username = $element.val();
		var data = {
			action: 'msfp_pre_validate_reg_username',
			username: username,
			nonce: ajax.nonce
		};
		$.ajax({
            type: 'POST',
            url: ajax.ajaxurl,
            data: data,
			dataType: "json",
            success: function(r) {
				console.log(r);
				if (r.success) {
					$element.removeClass('msfp-registration-invalid');					
					$element.addClass("msfp-reg-username-valid");
					$element.next().next().remove('.fw-block-invalid-alert');
					// remove block-invalid if email is also valid
					if ($block.find('.msfp-reg-email-valid').length > 0) {
						$block.removeClass('fw-block-invalid');
					}

				} else {
					$block.addClass('fw-block-invalid');
					$element.removeClass("msfp-reg-username-valid");										
					$element.addClass('msfp-registration-invalid');
					if (!$element.next().next().hasClass('fw-block-invalid-alert')){
						$element.next().after('<div class="fw-block-invalid-alert">' + r.error + '</div>');
					}
				}
            },
            fail: function(resp) {
				valid = false;				
				warn('response', resp);
				warn('responseText', resp.responseText);
			}
		});
	}

    function validate($wizard) {
        var formValid = true;
        $('.fw-wizard-step').each(function(idx, element) {
            var $step = $(element);
            if (!validateStep(idx)) {
                formValid = false;
            }
		});
        return formValid;
    }

    /**
     * responseMessage - the message that shows up after form submit
     *
     * @param  {string} rsp the response message
     * @param  {boolean} success successful submit of fail
     */
    function alertUser(message, success) {
        $('.fw-alert-user').empty().removeClass('fw-alert-user-fail fw-alert-user-success');
        if (success) {
            $('.fw-alert-user').addClass('fw-alert-user-success')
                .append('<i class="fa fa-check-circle" aria-hidden="true"></i>');
        } else {
            $('.fw-alert-user').addClass('fw-alert-user-fail')
                .append('<i class="fa fa-times-circle" aria-hidden="true"></i>');
        }
        $('.fw-alert-user').append(message)
            .fadeIn().delay(2000).fadeOut();
    }

    function submit(evt) {
        var summary, name, email, reg;
        var files = [];
        var $wizard = $(this).closest('.fw-wizard');
        // reset fw-block-invalid flags
        $('.fw-block-invalid').each(function(i, element) {
            $(element).removeClass('fw-block-invalid');
        })
        if (validate($wizard)) {
            $('.fw-spinner').show();
            summary = getSummary($wizard);
            files = getAttachments();
			email = $wizard.find('[data-id="email"]').first().val();
			if ($wizard.find('[data-type=fw-registration]')) {
				reg = getRegistration();
			}

            sendEmail(summary, email, files, reg);
        }
    }

    function sendEmail(summary, email, files, reg) {
        var id = $('#multi-step-form').attr('data-wizardid');
        $('.fw-btn-submit').html('<i class="fa fa-spinner"></i> ' + ajax.i18n.sending);
        $.post(
            ajax.ajaxurl, {
                action: 'fw_send_email',
                id: id,
                fw_data: summary,
				email: email,
				reg: reg,
                attachments: files,
                nonce: ajax.nonce
            },
            function(resp) {
                var url = $('.fw-container').attr('data-redirect');
                if (url) {
                    // redirect to thankyou page
                    window.onbeforeunload = null;
                    window.location.href = url;
                } else {
                    $('.fw-btn-submit').addClass('fw-submit-success').html('<i class="fa fa-check-circle"></i> ' + ajax.i18n.submitSuccess);
                    $('.fw-btn-submit').unbind( "click" );
                }
            }
        ).fail(function(resp) {
          $('.fw-btn-submit').addClass('fw-submit-fail').html('<i class="fa fa-times-circle"></i> ' + ajax.i18n.submitError);
          warn('response', resp);
          warn('responseText', resp.responseText);
        });
    }

    function uploadFiles(e, $label) {
        var id = $('#multi-step-form').attr('data-wizardid');
        var files = $(e.target).prop('files');
        var formData = new FormData();

		formData.append('action', 'fw_upload_file');
		for (var i = 0; i < files.length; i++) {
			formData.append('file' + i, files[i]);
		}
        formData.append('id', id);
		formData.append('nonce', ajax.nonce);
		
        $label.find('i').removeClass('fa-upload fa-times-circle fa-check-circle').addClass("fa-spinner");
        $label.find('span').text(ajax.i18n.uploadingFile);


        var $block = $(e.target).parent().parent();

        $.ajax({
            type: 'POST',
            url: ajax.ajaxurl,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "json",
            success: function(response) {
              setupLeaveWarning();
              if (response.success) {
                $block.attr('data-uploaded', 'true');
				$label.find('i').removeClass('fa-times-circle fa-spinner').addClass(" fa-check-circle");
				var fileNames = '';
				for(var i = 0; i < files.length; i++) {
					if (i > 0) {
						fileNames += ', ';
					}
					fileNames += files[i].name;
				}
                $label.find('span').html(fileNames);
              } else {
                $label.find('i').removeClass("fa-spinner fa-check-circle").addClass('fa-times-circle');
                $label.find('span').html(response.error);
                warn(response.error);
              }
            },
            fail: function(res) {
                console.warn(res);
            }
        });
    }

    function deleteAttachments(attachments) {
        $.post(
            ajax.ajaxurl, {
                action: 'fw_delete_files',
                filenames: attachments,
                nonce: ajax.nonce
            },
            function(resp) {
                if (resp) {
                  $('[data-type=fw-file]').each(function(i, e) {
                      var fileInput = $(e).find('input');
                      fileInput.replaceWith(fileInput.val('').clone(true));
                      $(e).find('label > i').removeClass('fa-check-circle').addClass('fa-upload');
                      $(e).find('label > span').text(ajax.i18n.chooseFile);
                      $(e).attr('data-uploaded', 'false');
                  });
                }
            }
        ).fail(function(resp) {
            warn('response', resp);
            warn('responseText', resp.responseText);
        });
	}
	
	function setupRegistration() {
		var $emailInput = $('.msfp-registration-input[data-id=email]');
		var $usernameInput = $('.msfp-registration-input[data-id=username]');
		var $block = $emailInput.closest('.fw-step-block');
		$emailInput.on("input", function(event) {
			validateRegEmail($emailInput);
		});
		$usernameInput.on("input", function(event) {
			validateRegUsername($usernameInput);
		});
	}

    function setupFileUpload() {
        $('.fw-file-upload-input').each(function() {
            var $input = $(this),
                $label = $input.next('label'),
                labelVal = $label.html(),
                $block = $input.parent().parent();

            $input.on('change', function(e) {
                var fileName = '';
                if (e.target.value)
                    fileName = e.target.value.split('\\').pop();
                if (fileName) {
                    uploadFiles(e, $label);
                }
                else
                    $label.html(labelVal);
            });
            $input.on('click', function(e) {
              // delete if input already has a file
              if (e.target.value) {
                var attachments = [];
                getAttachment($block, attachments);
                deleteAttachments(attachments);
              }
            });
            // Firefox bug fix
            $input.on('focus', function() {
                    $input.addClass('has-focus');
                })
                .on('blur', function() {
                    $input.removeClass('has-focus');
                });
        });
    }

    function setupSelect2() {
        $('select').each(function(idx, element) {
            console.log($(element).data('placeholder'));
            if (!$(element).data('search')) {
                $(element).select2({
                    minimumResultsForSearch: Infinity,
                    allowClear: true,
                    placeholder: ""
                })
            } else {
                $('select').select2({
                  allowClear: true,
                  placeholder: ""
                });
            }
        });
    }

    function setupColors() {
        var activeColor = $('.fw-progress-bar').attr('data-activecolor');
        var doneColor = $('.fw-progress-bar').attr('data-donecolor');
        var nextColor = $('.fw-progress-bar').attr('data-nextcolor');
        var buttonColor = $('.fw-progress-bar').attr('data-buttoncolor');
        $('head').append('<style id="fw-colors"></style>')
        if (activeColor) {
          $('head').append('<style>.fw-active .progress, ul.fw-progress-bar li.fw-active:before{background:' + activeColor + '!important;} [data-type=fw-checkbox] input[type=checkbox]:checked+label:before, ul.fw-progress-bar li.fw-active .fw-txt-ellipsis { color: ' + activeColor + ' !important; } .fw-step-part { border-color: ' + activeColor + ' !important; }</style>');
        }
        if (doneColor) {
          $('head').append('<style>ul.fw-progress-bar .fw-active:last-child:before, .fw-progress-step.fw-visited:before{ background:' + doneColor + ' !important; } .fw-progress-step.fw-visited, ul.fw-progress-bar .fw-active:last-child .fw-txt-ellipsis, .fw-progress-step.fw-visited .fw-txt-ellipsis { color:' + doneColor + ' !important;} ul.fw-progress-bar li.fw-visited:after, .fw-progress-step.fw-visited .fw-circle, .fw-progress-step.fw-visited .fw-circle-1, .fw-progress-step.fw-visited .fw-circle-2{ background-color:' + doneColor + ' !important;}</style>');
        }
        if (nextColor) {
          $('head').append('<style>ul.fw-progress-bar li:before{background:' + nextColor + ' !important;} .fw-progress-bar li.fw-active:after, li.fw-progress-step::after, .fw-circle, .fw-circle-1, .fw-circle-2{ background-color:' + nextColor + ' !important;} .fw-txt-ellipsis { color: ' + nextColor + ' !important; } </style>');
        }
        if (buttonColor) {
          $('head').append('<style>.fw-button-previous, .fw-button-next, .fw-button-fileupload { background: ' + buttonColor + ' !important; }</style>');
        }
    }

    function setupLeaveWarning() {
      if ($('#multi-step-form').length) {
        // show warning and delete attachments before leaving page
        window.onbeforeunload = function() {
            var attachments = getAttachments();
            deleteAttachments(attachments);
            return 'Your uploaded files were deleted from the server for security reasons.'
        };
      }
    }

    function setupDatepicker() {
      var format = $('.fw-datepicker-here').attr('data-dateformat');
      $('.fw-datepicker-here').datepicker({
		dateFormat: format,
		changeMonth: true,
		changeYear: true,
      });
	}
	
	function setupChangeListeners(){
		$('.fw-checkbox').change(check);
        $('.fw-radio').change(checkRadio);
        $('.fw-radio-conditional').change(checkConditional);
        $('.fw-text-input').on('change input', textOnChange);
        $('.fw-textarea').on('change input', textOnChange);
        $('.fw-checkbox, .fw-radio').on('change', function() {
            $(this).parents('.fw-step-block').removeClass('fw-block-invalid');
            $(this).parents('.fw-step-block').find('.fw-block-invalid-alert').remove();
		});
		$('.msfp-registration-input').change(textOnChange);
	}

    function setup() {

        var $wizard = $('.fw-wizard');

        $wizard.each(function(idx, element) {
            showStep($(element), 0);
        });

        var count = getStepCount($wizard);
        var parentWidth = $wizard.parent().outerWidth();

        if ((count >= 5 && parentWidth >= 769) ||
            (parentWidth >= 500)) {
            $wizard.addClass('fw-large-container');
        }

        $('.fw-progress-step[data-id="0"]').addClass('fw-active');
        $('.fw-button-previous').hide(); // prop('disabled', true);
        $('.fw-button-previous').click(previous);
        $('.fw-button-next').click(next);

        var showSummary = $('.fw-wizard-summary').attr('data-showsummary');
        if (showSummary == 'off') {
            $('.fw-toggle-summary').remove();
        }

		setupChangeListeners();

        setupSelect2();

        setupFileUpload();

        setupDatepicker();

        $('.fw-btn-submit').click(submit);

		setupColors();
		
		setupRegistration();

        updateSummary($('.fw-wizard'));
    }

    function init() {
        // setInterval(poll, 50);
        $(document).ready(function(evt) {
          if ($('#multi-step-form').length) {
            setup();
          }
        });

    }

    init();
});

(function() {
    "use strict";
})();
