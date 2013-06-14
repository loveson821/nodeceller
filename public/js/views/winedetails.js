window.WineView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change"        : "change",
        "click .save"   : "beforeSave",
        "click .delete" : "deleteWine",
        "drop #picture" : "dropHandler",
        "dragover #picture"      : "dragoverHandler"
    },

    dragoverHandler: function (event) {
        event.preventDefault();
    },

    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveWine();
        return false;
    },


    saveWine: function () {
        var self = this;
        console.log('before save');
        if(this.pictureFile){
            this.model.set('picture',this.pictureFile.name);
            fd = new FormData();
            fd.append( 'file', this.pictureFile );

            $.ajax({
              url: '/file-upload',
              data: fd,
              processData: false,
              contentType: false,
              type: 'POST',
              success: function(data){
                console.log('data: ' + data);
                alert(data);
              }
            });


        }

        this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('wines/' + model.id, false);
                utils.showAlert('Success!', 'Wine saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },

    deleteWine: function () {
        this.model.destroy({
            success: function () {
                alert('Wine deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    dropHandler: function (event) {
        console.log("drop handler affected");
        event.originalEvent.stopPropagation();
        event.originalEvent.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];


        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    }

});