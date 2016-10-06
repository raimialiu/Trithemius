    /* global $ */

    function showErrOrRes(type, text) {
        if (type == 'result') {
            $("#result-div").addClass("result").removeClass("error").html(text).fadeIn();
        }
        else {
            $("#result-div").addClass("error").removeClass("result").html(text).fadeIn();
        }
    }

    $(document).ready(function() {

        $("#operation").change(function() {
            $(".progress-bar").hide("fast");
            $("#result-div").hide("fast");

            if ($(this).val() == "hide") {

                $("#object-type option[value='file']").html("Hide file");
                $("#object-type option[value='string']").html("Hide string");
                $("#btn").html("Hide");
                $("#object-type").trigger("change");

            }
            else {

                $("#object-type option[value='file']").html("Retrieve file");
                $("#object-type option[value='string']").html("Retrieve string");
                $(".object").fadeOut();
                $("#btn").html("Retrieve");

            }
            $("#btn").fadeIn();
        });

        /* Object type select */
        $("#object-type").change(function() {
            if ($("#operation").val() == "hide") {

                if ($(this).val() == "string") {
                    $("#object-file-div").fadeOut("fast", function() {
                        $("#object-string-div").fadeIn("slow", "swing");
                    });

                }
                else {
                    $("#object-string-div").fadeOut("fast", function() {
                        $("#object-file-div").fadeIn("slow", "swing");
                    });
                }

            }
        });


        /* File selection */
        $('.upload-file').click(function() {
            var this_id = $(this).attr('id');
            var new_id = this_id.substring(0, this_id.indexOf('-')) + "-input";
            $("#" + new_id).click();
        });
        
        $('.file-input').change(function() {
            var this_id = $(this).attr('id');
            var new_id = this_id.substring(0, this_id.indexOf('-')) + "-file";
            
            var filename = $(this).val().split('\\').pop();
            var object_file = $('#'+new_id);
            
            $(object_file).val(!filename ? "" : filename + " [Click to change]");
            if (!object_file.val()) {
                object_file.css("background-color", "");
            }
            else {
                object_file.css("background-color", "lightCyan");
            }
        });

        /* Button pressed. Upload! */
        $("#btn").click(function() {
            $("#result-div").fadeOut("fast");

            var operation = $("#operation").val();
            var fileCar = $('#carrier-input').get(0).files[0];

            var objectType = $("#object-type").val();

            /*Create Form*/
            var formData = new FormData();

            formData.append('fileCarrier', fileCar, fileCar.name);
            formData.append('objectType', objectType);
            /* If we hide info, append info to form */
            if (operation == 'hide') {
                if (objectType == 'file') {
                    if ((!$('#carrier-input').val()) || (!$('#object-input').val())) {
                        showErrOrRes("error", "You have to select two files!");
                        return;
                    }
                    var fileObj = $('#object-input').get(0).files[0];
                    formData.append('fileObject', fileObj, fileObj.name);
                }
                else {
                    if ((!$('#carrier-input').val()) || (!$('#object-string').val())) {
                        showErrOrRes("error", "You have to select a file and input string!");
                        return;
                    }
                    formData.append('stringObject', $('#object-string').val());
                }
            }
            
            /* Hide button */
            $(this).fadeOut("fast", function() {
                /* Reset and show progress bar */
                $("#progress").fadeIn();
                $("#progressBar").css("width", "0%");
                $("#label").html("0%");
            });

            $.ajax({
                url: '/upload/' + operation,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    if (data.status == "error") {
                        showErrOrRes("error", data.error);
                    }
                    else {
                        if ((operation=="hide") || (objectType=="file")) {
                            showErrOrRes("result", "Download your file <a href=/getresult/" + data.result + "> HERE </a>");
                        } else {
                            showErrOrRes("result", "Result string: " + data.result);
                        }
                    }
                    $("#btn").fadeIn();
                    $("#progress").fadeOut();
                },
                xhr: function() {
                    // create an XMLHttpRequest
                    var xhr = new XMLHttpRequest();

                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', function(evt) {

                        if (evt.lengthComputable) {
                            // calculate the percentage of upload completed
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);

                            // update the Bootstrap progress bar with the new percentage
                            $('.progress-bar-box').text(percentComplete + '%');
                            $('.progress-bar-box').css({
                                width: percentComplete + '%'
                            });

                            // once the upload reaches 100%, set the progress bar text to done
                            if (percentComplete === 100) {
                                $('.progress-bar-box').html('Done');
                            }

                        }

                    }, false);

                    return xhr;
                }
            });
        });
        
        
        /* Init page */
        $("#object-string-div").hide();
    });